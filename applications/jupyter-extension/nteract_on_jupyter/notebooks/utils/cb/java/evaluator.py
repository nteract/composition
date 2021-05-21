import collections
import itertools
import time
from .lowlevel import *
from .modifiers import ALL_MODS
from copy import deepcopy


class ExpressionBuilder:
    def __init__(self):
        self.var_idx = 0
        self.exprs_to_vars = {}
        self.exprs_to_rss = {}
        self.vars_to_merges = {}
        self.vars_to_labels = {}
        self.vars_to_nids = {}
        self.result_set = 1

        self.last_ref = None
        self.statements = [ ]
        self.rs_to_stmts = [ None, [] ]
        self.rs_to_last_refs = [ None, [] ]
        self.nid_to_rs = {}

        self.result_vars = [ ]
    
    def label_var(self, var, labels, maps):
        self.vars_to_labels[var] = labels
        self.vars_to_nids[var] = maps

    def add_var(self, expr):
        # Handle marking things w/ what result_set they're in
        self.mark_expr_used(expr)

        if expr in self.exprs_to_vars:
            return self.exprs_to_vars[expr]
        
        self.var_idx += 1
        label = 'v_{}'.format(self.var_idx)
        self.exprs_to_vars[expr] = label
        self.statements.append('{} = {}'.format(label, expr))
        self.rs_to_stmts[self.result_set].append(self.statements[-1])
        self.last_ref = label
        return label
    
    def add_post_merge(self, lhs, rhs, key, needs_lookup):
        def _get_keys(cur):
            if isinstance(cur, list):
                res = []
                for i, l in enumerate(cur):
                    if l is not None:
                        res.append(('gids.' + str(i + 1), l)) 
                return res
        
            return list(map(
                lambda x: ('left.' + x[0], x[1]),
                _get_keys(cur['left'])
            )) + list(map(
                lambda x: ('right.' + x[0], x[1]),
                _get_keys(cur['right'])
            ))
        
        if needs_lookup[0]:
            lhs = self.rs_to_last_refs[lhs]
        if needs_lookup[1]:
            rhs = self.rs_to_last_refs[rhs]
        
        lhs_key = None
        for label, nid in _get_keys(self.vars_to_nids[lhs]):
            if nid == key:
                lhs_key = label
                break
        
        rhs_key = None
        for label, nid in _get_keys(self.vars_to_nids[rhs]):
            if nid == key:
                rhs_key = label
                break

        if rhs_key is None:
            print(self.vars_to_nids)
            print(rhs)
            print(needs_lookup)
            print(key)
            print()

        expr = 'merge_paths({}, {}, on=("{}", "{}"))'.format(
            lhs, rhs, lhs_key, rhs_key
        )

        if expr in self.exprs_to_vars:
            return self.exprs_to_vars[expr], None

        self.var_idx += 1
        label = 'm_{}'.format(self.var_idx)
        self.exprs_to_vars[expr] = label

        # Handle labeling updates
        self.vars_to_labels[label] = {
            'left': self.vars_to_labels[lhs],
            'right': self.vars_to_labels[rhs]
        }
        self.vars_to_nids[label] = {
            'left': self.vars_to_nids[lhs],
            'right': self.vars_to_nids[rhs]
        }

        s1 = '{} = {}'.format(label, expr)
        self.var_idx += 1
        s2 = 'rs_{} = get_results({}, {})'.format(
            self.var_idx, label,
            self.vars_to_labels[label]
        )

        self.statements.append(s1)
        self.statements.append(s2)

        return label, 'rs_{}'.format(self.var_idx)


    def add_merge(self, lhs, lhs_key, rhs, rhs_key):
        if self.result_set in self.vars_to_merges:
            if lhs in self.vars_to_merges[self.result_set]:
                lhs, nk = self.vars_to_merges[self.result_set][lhs]
                lhs_key = nk + '.' + lhs_key
            if rhs in self.vars_to_merges[self.result_set]:
                rhs, nk = self.vars_to_merges[self.result_set][rhs]
                rhs_key = nk + '.' + rhs_key

        expr = 'merge_paths({}, {}, on=("{}", "{}"))'.format(
            lhs, rhs, lhs_key, rhs_key
        )

        # Handle marking things w/ what result_set they're in
        self.mark_expr_used(expr)
        self.mark_var_used(lhs)
        self.mark_var_used(rhs)

        self.var_idx += 1
        label = 'm_{}'.format(self.var_idx)
        self.exprs_to_vars[expr] = label
        self.statements.append('{} = {}'.format(label, expr))
        self.rs_to_stmts[self.result_set].append(self.statements[-1])
        self.last_ref = label

        # Handle labeling updates
        self.vars_to_labels[label] = {
            'left': self.vars_to_labels[lhs],
            'right': self.vars_to_labels[rhs]
        }
        self.vars_to_nids[label] = {
            'left': self.vars_to_nids[lhs],
            'right': self.vars_to_nids[rhs]
        }

        # Map vars -> merges
        if self.result_set not in self.vars_to_merges:
            self.vars_to_merges[self.result_set] = {}
        if rhs not in self.vars_to_merges[self.result_set]:
            self.vars_to_merges[self.result_set][rhs] = (label, 'right')
        if lhs not in self.vars_to_merges[self.result_set]:
            self.vars_to_merges[self.result_set][lhs] = (label, 'left')

        return label

    def note_leaf(self, nid, path, labels, maps):
        path = "query_java('{}')".format(path)
        if path not in self.exprs_to_vars:
            ref = self.add_var(path)
            self.label_var(ref, labels, maps)
            self.mark_var_used(ref)

        self.statements.append(
            'rs_{} = get_results({}, {})'.format(
                self.result_set,
                self.last_ref,
                self.vars_to_labels[self.last_ref]
            )
        )
        self.statements.append(
            '# ^^ End Results Set {}\n'.format(self.result_set)
        )
        self.rs_to_last_refs[self.result_set] = self.last_ref
        self.nid_to_rs[nid] = self.result_set
        self.result_set += 1
        self.rs_to_stmts.append([])
        self.rs_to_last_refs.append('')
    
    def mark_expr_used(self, expr):
        if expr not in self.exprs_to_rss:
            self.exprs_to_rss[expr] = set()
        self.exprs_to_rss[expr].add(self.result_set)

    def mark_var_used(self, var):
        for k,v in self.exprs_to_vars.items():
            if v == var:
                self.exprs_to_rss[k].add(self.result_set)
    
    def execute(self, debug=False):
        start = time.perf_counter()
        state = {} 
        for s in self.statements:
            if s.startswith('#'):
                continue

            key, expr = s.split(' = ')

            if len(self.result_vars) > 0: 
                if key.startswith('rs_') and key not in self.result_vars:
                    if debug:
                        print('skipped (not in final result set): {}'.format(s))
                    continue

            if debug:
                ellapsed_time = time.perf_counter() - start
                print('eval [{:.4f}s]: {}'.format(ellapsed_time, s))

            state[key] = eval(
                expr, 
                { 
                    'query_java': query_java,
                    'merge_paths': merge_paths,
                    'get_results': get_results,
                }, 
                state
            )
        
        if debug:
            ellapsed_time = time.perf_counter() - start
            print('eval [{:.4f}s]: COMPLETE.'.format(ellapsed_time))

        # By default, we just enumerate result sets as output
        if len(self.result_vars) == 0:
            for i in range(1, self.result_set):
                yield state['rs_{}'.format(i)]
        else: # But we might have "overidden" that
            for var in self.result_vars:
                yield state[var]
        
    def dump(self):
        for s in self.statements:
            print(s)


class EvalStateStack:
    def __init__(self):
        self.depths = [ -1 ]
        self.paths = [ '' ]
        self.labels = [ [] ]
        self.maps = [ [] ]
        self.constraints = [ [] ]

        self.has_lhs = [ False ]
        self.lhs_info = [ None ]
        self.lhs_labels = [ None ]
        self.lhs_maps = [ None ]
        self.has_rhs = [ False ]
        self.rhs_info = [ None ]
        self.pop_r = [ -1 ]
        self.pop_l = [ -1 ]

    def depth(self):
        return self.depths[-1]

    def begin_updates(self, depth):
        self.depths.append(depth)

    def set_rhs(self, merge_key_r):
        self.pop_r.append(self.depths[-1])
        self.has_rhs.append(True)
        self.rhs_info.append((None, merge_key_r))
    
    def set_lhs(self, path, labels, maps, merge_key_l):
        self.pop_l.append(self.depths[-1])
        self.has_lhs.append(True)
        self.lhs_info.append((path, merge_key_l))
        self.lhs_labels.append(labels)
        self.lhs_maps.append(maps)

    def update_constraints(self, node):
        # If we are a 'virtual' node, forward constraints
        # but don't increment the expr idx
        if node.type[0] == '$':
            last = self.constraints[-1]
            self.constraints.append(last + node.constraints)
            return
        
        # Otherwise, no constraints forwarded, but do increment
        # expr idx (which counts _backwards_ as we build paths 
        # from right to left)
        self.constraints.append([])
    
    def update_path_info(self, node, nidx):
        # Used to build up a complete path expression
        # and (as part of that) handle constraint forwarding
        forwarded_constraints = []
        if len(self.constraints) > 1:
            # Reach back to parent for (possibly)
            # forwarded constraints (if parent was 'virtual' node)
            forwarded_constraints = self.constraints[-2] 
        
        # Add constraints (if we have any) before asking 
        # for the path fragement created by this node
        path_segment = node.add_constraints(
            *forwarded_constraints
        ).to_path()

        # Add it (segment + prev) [Note: we're kind of 
        # building this "backwards"]
        self.paths.append(path_segment + self.paths[-1])

        if node.type[0] == '$':
            self.labels.append(self.labels[-1])
            self.maps.append(self.maps[-1])
        else:
            self.labels.append([ node.label ] + self.labels[-1])
            self.maps.append([ nidx ] + self.maps[-1])

    def pop(self):
        self.constraints.pop()
        depth = self.depths.pop()
        path = self.paths.pop()
        labels = self.labels.pop()
        maps = self.maps.pop()
        
        lhs = self.lhs_info[-1]
        rhs = self.rhs_info[-1]
        lhs_labels = self.lhs_labels[-1]
        lhs_maps = self.lhs_maps[-1]

        if self.pop_l[-1] == depth:
            self.pop_l.pop()
            self.has_lhs.pop()
            self.lhs_info.pop()
            self.lhs_labels.pop()
            self.lhs_maps.pop()
        
        if self.pop_r[-1] == depth:
            self.pop_r.pop()
            self.has_rhs.pop()
            self.rhs_info.pop()

        return path, labels, maps, lhs, rhs, lhs_labels, lhs_maps
    
    def has_merge(self):
        return self.has_lhs[-1] and self.has_rhs[-1]

    def top(self):
        return self.paths[-1], self.labels[-1], self.maps[-1]

    def push_blank(self, depth):
        self.constraints.append([])
        self.depths.append(depth)
        self.paths.append('')
        self.labels.append([])
        self.maps.append([])


class ResultSetMerge:
    _id = 0
    _rid_to_var = {}

    def __init__(self, rs = None):
        self.result_sets = [ rs ] if rs is not None else [ ]
        self.on = None
        ResultSetMerge._id += 1
        self.id = ResultSetMerge._id

    def mark_on(self, on):
        new_rss = []
        for rs in self.result_sets:
            tmp = ResultSetMerge()
            tmp.extend(list(rs) if isinstance(rs, tuple) else [ rs ])
            tmp.on = on
            new_rss.append(tmp)
            
        self.result_sets = new_rss
        self.on = None
    
    def is_leaf(self):
        return all([ isinstance(x, int) for x in self.result_sets ])

    def extend(self, other):
        if isinstance(other, list):
            self.result_sets.extend(other)
            return
        
        # Otherwise, we are a ResultSetMerge
        assert isinstance(other, ResultSetMerge)
        if len(other.result_sets) > 0 and other.on is None:
            self.result_sets.extend(other.result_sets)
        elif len(other.result_sets) > 0:
            self.result_sets.append(other)
    
    def __str__(self):
        return 'on:={} ; rss:=[ {} ]'.format(
            self.on, ', '.join(map(str, self.result_sets))
        )

    def apply_step(self, rsm, parent, exprb):
        if rsm.on is None:
            return

        assert len(rsm.result_sets) == 2

        needs_lookup_lhs = True
        needs_lookup_rhs = True
        the_lhs = rsm.result_sets[0]
        the_rhs = rsm.result_sets[1]

        if isinstance(the_lhs, ResultSetMerge):
            the_lhs = ResultSetMerge._rid_to_var[the_lhs.id][0]
            needs_lookup_lhs = False
        
        if isinstance(the_rhs, ResultSetMerge):
            the_rhs = ResultSetMerge._rid_to_var[the_rhs.id][0]
            needs_lookup_rhs = False

        res = exprb.add_post_merge(
            lhs=the_lhs,
            rhs=the_rhs,
            key=rsm.on,
            needs_lookup=(needs_lookup_lhs, needs_lookup_rhs)
        )

        ResultSetMerge._rid_to_var[rsm.id] = res

        if parent.on is None:
            exprb.result_vars.append(res[1])
        
    
    def apply(self, exprb):
        # Reset some shared state
        ResultSetMerge._id = 0
        ResultSetMerge._rid_to_var = { }

        worklist = [ (self, None) ]
        
        last = None
        while len(worklist) > 0:
            root, parent = worklist[-1]

            do_pop = root.is_leaf()
            do_pop = do_pop or (
                last is not None and (last in root.result_sets)
            )
            if do_pop:
                self.apply_step(root, parent, exprb)
                worklist.pop()
                last = root
            else:
                for child in root.result_sets[::-1]:
                    if not isinstance(child, int):
                        worklist.append((child, root))
    
    @staticmethod
    def cross_product(rss_list):
        if all([ x.on is None for x in rss_list ]):
            res = ResultSetMerge()
            res.extend(list(itertools.product(*[
                x.result_sets for x in rss_list
            ])))
            return res
        assert False, "TODO?"


class Preprocessor:
    def __init__(self, query):
        self.worklist = [ query ]
        self.nids_to_rss = { }
        self.nid_to_rs = None
    
    def preprocess(self, exprb):
        self.nid_to_rs = exprb.nid_to_rs

        last = None
        while len(self.worklist) > 0:
            root = self.worklist[-1]
            if len(root.children) == 0 or last is not None and (last in root.children):
                self.preproc_step(root)
                self.worklist.pop()
                last = root
            else:
                for child in root.children[::-1]:
                    self.worklist.append(child)
        
        # Return the collection of result-set-merges the 
        # original (input) query will require
        return self.nids_to_rss[1]

    def preproc_step(self, node):
        # Note if we are an $and
        if node.type == '$and':
            self.nids_to_rss[node.id] = ResultSetMerge.cross_product(
                [ self.nids_to_rss[child.id] for child in node.children ]
            )

        
        if len(node.children) == 0:
            self.nids_to_rss[node.id] = ResultSetMerge(
                self.nid_to_rs[node.id]
            )
        elif node.type != '$and':
            self.nids_to_rss[node.id] = ResultSetMerge()
            for child in node.children:
                if child.type == '$and':
                    self.nids_to_rss[child.id].mark_on(node.id)
                self.nids_to_rss[node.id].extend(
                    self.nids_to_rss[child.id]
                )



class Evaluator:
    def __init__(self, query, show_plan=False):
        # Rewrite query
        for mod in ALL_MODS:
            while query.has_mod(mod):
                query = query.rewrite_mods([mod])

        # Assign each node a unique ID. This will
        # help us with later tasks
        query.idify()
        if show_plan:
            print(query)

        # Key data structures: the worklist and stack
        # of state that gets "unrolled" when we backtrack
        # and the expression builder
        self.worklist = collections.deque([ (query, 0) ])
        self.state_stack = EvalStateStack()
        self.expr_builder = ExpressionBuilder()
        self.expr_len = [ 1 ]
        self.nidx = 0

    def evaluate(self, debug=False, no_execute=False, dump_stmts=False):
        preproc = Preprocessor(self.worklist[0][0])

        while len(self.worklist) > 0:
            self.eval_step()

        top_level_merges = preproc.preprocess(self.expr_builder)
        top_level_merges.apply(self.expr_builder)

        if dump_stmts:
            self.expr_builder.dump()

        if not no_execute:
            return list(self.expr_builder.execute(debug=debug))

        return [ {} ]

    def eval_step(self):
        self.nidx += 1

        # Grab a node, its depth, and "unroll" our 
        # state tracker back to that depth
        node, depth = self.worklist.pop()
        while self.state_stack.depth() >= depth:
            self.state_stack.pop()
            self.expr_len.pop()

        # Check if we are merge lhs/rhs
        left_side_of_merge = node.merge_key_l is not None
        right_side_of_merge = node.merge_key_r is not None

        # If we are the rhs of a merge, start tracking
        if right_side_of_merge:
            self.state_stack.set_rhs(node.merge_key_r)
        
        # If non-virtual, inc len
        self.expr_len.append(
            self.expr_len[-1] + (
                1 if node.type[0] != '$' else 0
            )
        )

        # Update state
        self.state_stack.begin_updates(depth)
        self.state_stack.update_constraints(node)
        self.state_stack.update_path_info(node, self.nidx)

        top_path, top_labels, top_maps = self.state_stack.top()

        # (1) We are a leaf
        if len(node.children) == 0:
            path, labels, maps, lhs, rhs, lhs_labels, lhs_maps = self.state_stack.pop()
            expr_len = self.expr_len.pop()

            if self.state_stack.has_merge():
                ref1 = self.expr_builder.add_var(
                    "query_java('{}')".format(lhs[0])
                )
                self.expr_builder.label_var(ref1, lhs_labels, lhs_maps)

                ref2 = self.expr_builder.add_var(
                    "query_java('{}')".format(path)
                )
                self.expr_builder.label_var(ref2, labels, maps)

                self.expr_builder.add_merge(
                    ref1, lhs[1] + '.1',
                    ref2, rhs[1] + '.{}'.format(expr_len - 1)
                )

            self.expr_builder.note_leaf(node.id, path, labels, maps)
        # (2) We are the left hand side of a merge
        elif left_side_of_merge:
            path, labels, maps, lhs, rhs, lhs_labels, lhs_maps = self.state_stack.pop()
            expr_len = self.expr_len.pop()
            
            self.state_stack.push_blank(depth)
            self.expr_len.append(1)

            if self.state_stack.has_merge():
                ref1 = self.expr_builder.add_var(
                    "query_java('{}')".format(lhs[0])
                )
                self.expr_builder.label_var(ref1, lhs_labels, lhs_maps)

                ref2 = self.expr_builder.add_var(
                    "query_java('{}')".format(path)
                )
                self.expr_builder.label_var(ref2, labels, maps)

                self.expr_builder.add_merge(
                    ref1, lhs[1] + '.1',
                    ref2, rhs[1] + '.{}'.format(expr_len - 1)
                )

        # If we are merge lhs, start tracking
        if left_side_of_merge:
            self.state_stack.set_lhs(
                top_path, top_labels, top_maps, node.merge_key_l
            )

        # Don't forget to visit children!
        for child in node.children:
            self.worklist.append((child, depth + 1))


