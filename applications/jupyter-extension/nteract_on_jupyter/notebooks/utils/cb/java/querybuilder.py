import re
from copy import deepcopy


def _has_mod(mod):
    return lambda n: any(map(
        lambda m: m.kind == mod.kind(), n.modifiers
    )) if n is not None else False


class CB:
    _depth = 0

    def __init__(self, init=None):
        self.kind = 'Java.Code.Root'

        self.label = None
        self.type = init
        self.children = []
        self.constraints = []
        self.modifiers = []

        self.last = self
        self.parent = None

        self.merge_key_l = None
        self.merge_key_r = None

    def idify(self):
        idx = 0
        worklist = [ self ]
        while len(worklist) > 0:
            idx += 1
            current = worklist.pop()
            current.id = idx
            for child in current.children:
                worklist.append(child)

    def part_of_merge(self):
        return (
            self.merge_key_l is not None 
            or self.merge_key_r is not None
        )

    def remove_mod(self, mod):
        self.modifiers = [
            x for x in self.modifiers if x.kind != mod.kind()
        ]
        return self

    def without_mods(self):
        self.modifiers = []
        return self

    def with_mods(self, *args):
        self.modifiers = list(args)
        return self

    def with_mod(self, mod):
        self.modifiers.append(mod)
        return self

    def with_constraints(self, *args):
        self.constraints = list(args)
        return self

    def add_constraints(self, *args):
        self.constraints.extend(list(args))
        return self

    def with_constraint(self, constraint):
        self.constraints.append(constraint)
        return self

    def is_merge(self, lkey, rkey):
        assert len(self.children) == 1
        self.merge_key_l = lkey
        self.children[0].merge_key_r = rkey
        return self

    def with_labels_from(self, other):
        self.label = other.label
        return self

    def without_labels(self):
        self.label = None
        return self

    #############################################################################
    # TREE-PATH-EXPR CONVERSION
    #############################################################################
    
    def to_path(self):
        if self.type.startswith('$'):
            return '' # Virtual nodes have no contribution (at this level)

        # Handle "normal" nodes
        as_path = self.type if '$' not in self.type else ''
        for con in sorted(self.constraints, key=lambda c: c.precedence):
            as_path = con.to_path(as_path)
        return as_path
    
    #############################################################################
    # QUERY CONSTRUCTION (merge/bubbleup/nest)
    #############################################################################

    def bubbleup(self):
        self.last = self.last.parent
        return self

    def nest(self, other):
        self.last.children.append(other)
        self.last = other
        self.last.parent = self
        return self

    def merge(self, other):
        self.parent = other.parent
        self.last.type = other.type
        self.last.label = other.label
        self.last.children += other.children
        self.last.constraints += other.constraints
        self.last.modifiers += other.modifiers
        return self

    def insert_and(self):
        new_root = deepcopy(self)
        old_children = new_root.children
        new_root.children = []
        new_root.last = new_root

        the_and = CB('$and')
        for child in old_children:
            the_and.nest(child).bubbleup()
        
        return new_root.nest(the_and)

    #############################################################################
    # TREE WALK/EDIT
    #############################################################################

    def has_mod(self, mod):
        if _has_mod(mod)(self):
            return True

        child_results = []
        for child in self.children:
            child_results.append(
                child.has_mod(mod)
            )
        return any(child_results)

    def rewrite(self, selector, rewriter):
        if selector(self):
            return rewriter(self)

        new_children = []
        for child in self.children:
            new_children.append(
                child.rewrite(selector, rewriter)
            )
        self.children = new_children
        return self
    
    def rewrite_mods(self, mods):
        changed = self
        for mod in mods:
            changed = changed.rewrite(_has_mod(mod), mod.rewrite)
        return changed

    #############################################################################
    # LABEL ASSIGN (via %)
    # - usage CB(..) % 'label'
    #############################################################################

    def __mod__(self, other):
        self.label = other
        return self

    def __rmod__(self, other):
        self.label = other
        return self

    #############################################################################
    # DISPLAY (str/debug methods)
    #############################################################################

    def __str__(self):
        indent = ' ' * CB._depth
        res = '{}(\n'.format(indent)

        # Render our props 
        if self.merge_key_l:
            res += '{}  MERGE (L) key=`{}`\n'.format(indent, self.merge_key_l)
        if self.merge_key_r:
            res += '{}  MERGE (R) key=`{}`\n'.format(indent, self.merge_key_r)
        if self.type is not None:
            if hasattr(self, 'id'):
                res += '{}  type ({})=`{}`\n'.format(indent, self.id, self.type)
            else:
                res += '{}  type=`{}`\n'.format(indent, self.type)
        if len(self.modifiers) > 0:
            res += '{}  mods={{{}}}\n'.format(indent,
                                              ';'.join(map(str, self.modifiers)))
        if len(self.constraints) > 0:
            res += '{}  cons={{{}}}\n'.format(indent,
                                              ';'.join(map(str, self.constraints)))
        if self.label is not None:
            res += '{}  label=`{}`\n'.format(indent, self.label)
        
        # Render children (indent/dedent)
        CB._depth += 2
        res += '{}  children=[\n'.format(indent)
        res += (','.join(map(str, self.children)) +
                '\n') if len(self.children) > 0 else ''
        CB._depth -= 2
        
        res += '{}  ]\n'.format(indent)
        res += '{})'.format(indent)

        # Fixup (make prettier)
        res = re.sub(r'\)\n *\]', ')]', res)
        res = re.sub(r'\[\n *\(', '[(', res)
        res = re.sub(r'\[\n *\n? *\]', '[ ]', res)
        res = re.sub(r'\), +\(', '), (', res)
        return res

    #############################################################################
