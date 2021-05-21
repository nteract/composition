import json
import regex
import pickle
import os.path
import xxhash
import pandas as pd
import pyarrow as pa
import pyarrow.dataset as ds 
import pyarrow.parquet as pq 
import pyarrow.gandiva as gd

TYPE_TO_BYTES = [
    'annotated_type',
    'annotation',
    'annotation_argument_list',
    'annotation_type_body',
    'annotation_type_declaration',
    'annotation_type_declaration_ref',
    'annotation_type_element_declaration',
    'annotation_type_element_declaration_ref',
    'argument_list',
    'array_access',
    'array_creation_expression',
    'array_initializer',
    'array_type',
    'assert_statement',
    'assignment_expression',
    'asterisk',
    'binary_expression',
    'binary_integer_literal',
    'block',
    'boolean_type',
    'break_statement',
    'cast_expression',
    'catch_clause',
    'catch_formal_parameter',
    'catch_formal_parameter_ref',
    'catch_type',
    'character_literal',
    'class_body',
    'class_declaration',
    'class_declaration_ref',
    'class_literal',
    'comment',
    'constant_declaration',
    'constant_declaration_ref',
    'constructor_body',
    'constructor_declaration',
    'constructor_declaration_ref',
    'continue_statement',
    'decimal_floating_point_literal',
    'decimal_integer_literal',
    'declaration',
    'dimensions',
    'dimensions_expr',
    'do_statement',
    'element_value_array_initializer',
    'element_value_pair',
    'enhanced_for_statement',
    'enhanced_for_statement_ref',
    'enum_body',
    'enum_body_declarations',
    'enum_constant',
    'enum_declaration',
    'enum_declaration_ref',
    'explicit_constructor_invocation',
    'expression',
    'expression_statement',
    'extends_interfaces',
    'f_alternative',
    'f_arguments',
    'f_array',
    'f_body',
    'f_child',
    'f_condition',
    'f_consequence',
    'f_constructor',
    'f_declarator',
    'f_dimensions',
    'f_element',
    'f_field',
    'f_index',
    'f_init',
    'f_interfaces',
    'f_key',
    'f_left',
    'f_name',
    'f_object',
    'f_operand',
    'f_operator',
    'f_parameters',
    'f_resources',
    'f_right',
    'f_scope',
    'f_superclass',
    'f_type',
    'f_type_arguments',
    'f_type_parameters',
    'f_update',
    'f_value',
    'false',
    'field_access',
    'field_declaration',
    'field_declaration_ref',
    'finally_clause',
    'floating_point_type',
    'for_statement',
    'formal_parameter',
    'formal_parameter_ref',
    'formal_parameters',
    'generic_type',
    'hex_floating_point_literal',
    'hex_integer_literal',
    'identifier',
    'if_statement',
    'import_declaration',
    'import_declaration_ref',
    'inferred_parameters',
    'instanceof_expression',
    'integral_type',
    'interface_body',
    'interface_declaration',
    'interface_declaration_ref',
    'interface_type_list',
    'labeled_statement',
    'lambda_expression',
    'literal',
    'local_variable_declaration',
    'local_variable_declaration_ref',
    'marker_annotation',
    'method_declaration',
    'method_declaration_ref',
    'method_invocation',
    'method_reference',
    'modifiers',
    'module_body',
    'module_declaration',
    'module_declaration_ref',
    'module_directive',
    'null_literal',
    'object_creation_expression',
    'octal_integer_literal',
    'package_declaration',
    'package_declaration_ref',
    'parenthesized_expression',
    'primary_expression',
    'program',
    'receiver_parameter',
    'requires_modifier',
    'resource',
    'resource_specification',
    'return_statement',
    'scoped_identifier',
    'scoped_type_identifier',
    'simple_type',
    'spread_parameter',
    'statement',
    'static_initializer',
    'string_literal',
    'super',
    'super_interfaces',
    'superclass',
    'switch_block',
    'switch_label',
    'switch_statement',
    'synchronized_statement',
    'ternary_expression',
    'this',
    'throw_statement',
    'throws',
    'true',
    'try_statement',
    'try_with_resources_statement',
    'type',
    'type_arguments',
    'type_bound',
    'type_identifier',
    'type_parameter',
    'type_parameters',
    'unannotated_type',
    'unary_expression',
    'update_expression',
    'variable_declarator',
    'variable_declarator_ref',
    'void_type',
    'while_statement',
    'wildcard'
]

__F_CACHE = {}
__DATA = None
__T_CACHE = {}

def type_to_bytes(the_type):
    return TYPE_TO_BYTES.index(the_type).to_bytes(2, byteorder='little')

def type_to_idx(the_type):
    return TYPE_TO_BYTES.index(the_type)

QUERY_LANG = r"^((\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?\(?([a-z_0-9]+)?\)?(\.f_[a-z_0-9]+)?(\[\d+\])?)+$"
SUB_QUERY_LANG = r"(\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?\(?([a-z_0-9]+)?\)?(\.f_[a-z_0-9]+)?(\[\d+\])?"
QUERY_REGEX = regex.compile(QUERY_LANG)
SUB_QUERY_REGEX = regex.compile(SUB_QUERY_LANG)

def get_text_fragement(fid, start, end, debug=False):
    if debug:
        return 'get_file({}@{}:{})'.format(fid, start, end)
    try:
        if fid not in __F_CACHE:
            with open('/data/raw-files/{}.txt'.format(fid), 'rb') as fh:
                __F_CACHE[fid] = fh.read()
        return __F_CACHE[fid].decode('utf-8')[start:end]
    except Exception as ex:
        return str(ex) + '\ncant find {}@{}:{}'.format(fid, start, end)


def decode_op_dist(dist):
    if dist is None or len(dist.replace('{', '').replace('}', '')) <= 0:
        return 0, int(0)
    
    dist = dist[1:-1]
    if dist[0] == '=':
        return 5, int(dist[1:])
    elif dist[:2] == '<=':
        return 2, int(dist[2:])
    elif dist[:2] == '>=':
        return 4, int(dist[2:])
    elif dist[0] == '<':
        return 1, int(dist[1:])
    elif dist[0] == '>':
        return 3, int(dist[1:])
    else:
        return 0, int(dist)


def parse_query(query_string, type_to_idx, debug=False):
    builder = gd.TreeExprBuilder()

    if query_string[0] != '{':
        query_string = '{}' + query_string

    match = regex.match(QUERY_REGEX, query_string, version=regex.V1)

    target_func = 'match_tree_path_{}_'.format(len(match.captures(1)))

    params = []

    first_label = '?'

    for i, sub_string in enumerate(match.captures(1)):
        sub_match = regex.match(SUB_QUERY_REGEX, sub_string, version=regex.V1)
        steps, _, negate, name, label, field, index = sub_match.groups()

        if first_label == '?':
            first_label = label

        negate = negate == '^'

        match_name = name is not None
        name = name[1:-2] if match_name else None
        
        match_label = label is not None
        label = type_to_idx(label) if match_label else 0

        match_field = field is not None
        field = type_to_idx(field[1:]) if match_field else 0

        match_index = index is not None
        index = int(index[1:-1]) if match_index else 0
    
        steps_op, steps_dist = decode_op_dist(steps)

        target_func += ('1' if negate else '0')
        target_func += ('1' if match_label else '0')
        target_func += ('1' if match_name else '0')
        target_func += ('1' if match_field else '0')
        target_func += ('1' if match_index else '0')
        
        if match_label:
            params.append(builder.make_literal(label, pa.uint16()))

        if match_name:
            as_hash = int.from_bytes(
                xxhash.xxh64(name, seed=3235823838).intdigest().to_bytes(8, byteorder='little'),
                signed=True, byteorder="little"
            )
            params.append(builder.make_literal(as_hash, pa.int64()))
        
        if match_field:
            params.append(builder.make_literal(field, pa.uint16()))

        if match_index:
            params.append(builder.make_literal(index, pa.uint16()))
            
        if steps_op == 5:
            target_func += '3'
            params.append(builder.make_literal(steps_dist, pa.uint16()))
        elif steps_op == 4:
            target_func += '2'
            params.append(builder.make_literal(steps_dist - 1, pa.uint16()))
        elif steps_op == 3:
            target_func += '2'
            params.append(builder.make_literal(steps_dist, pa.uint16()))
        elif steps_op == 2:
            target_func += '1'
            params.append(builder.make_literal(steps_dist + 1, pa.uint16()))
        elif steps_op == 1:
            target_func += '1'
            params.append(builder.make_literal(steps_dist, pa.uint16()))
        else:
            target_func += '0'

        target_func += '_'
    
    target_func = target_func[:-1]
    if debug:
        print(first_label, target_func, params)

    return first_label, target_func, params, builder


def get_text_from_capture(res, cidx):
    offset = 32 + (cidx - 1) * 40
    return get_text_fragement(
        int.from_bytes(res[0:8], signed=True, byteorder="little"),
        int.from_bytes(res[offset+0:offset+4], signed=False, byteorder="little"),
        int.from_bytes(res[offset+4:offset+8], signed=False, byteorder="little")
    )

def get_texts_from_capture(res, cidx):
    offset = 32 + (cidx - 1) * 40
    out = []
    for r in res:
        out.append(get_text_fragement(
            int.from_bytes(r[0:8], signed=True, byteorder="little"),
            int.from_bytes(r[offset+0:offset+4], signed=False, byteorder="little"),
            int.from_bytes(r[offset+4:offset+8], signed=False, byteorder="little")
        ))
    return out


def query_java(query_string, extra="file_id", name_is=None, name_regex=None):
    global __DATA, __T_CACHE
    
    root_type, target_func, params, builder = parse_query(query_string, type_to_idx)

    as_table = None
    proj = None

    if __DATA is None:
        __DATA = ds.dataset('/data/parquet', format='parquet', partitioning='hive')

    if root_type not in __T_CACHE:
        the_filter = ds.field('type') == root_type

        extra_cols = [extra]
        if name_is is not None:
            extra_cols.append('name')
            the_filter = the_filter & (ds.field('name') == name_is)
        elif name_regex is not None:
            print('Regex name filter not yet supported')

        __T_CACHE[root_type] = __DATA.to_table(
            columns=['path'] + extra_cols,
            filter=the_filter
        )
    
    as_table = __T_CACHE[root_type]
        
    params = [
        builder.make_field(as_table.schema.field(extra)),
        builder.make_field(as_table.schema.field('path'))
    ] + params

    proj = gd.make_projector(as_table.schema, [
        builder.make_expression(
            builder.make_function(target_func, params, pa.binary()),
            pa.field("result", pa.binary())
        )
    ], pa.default_memory_pool())

    total = []
    for record_batch in as_table.to_batches():
        res, = proj.evaluate(record_batch)
        temp = res.to_pandas()
        total.append(temp[temp != b''])
    
    if len(total) > 0:
        return pd.concat(total)
    else:
        return pd.Series([ b'' ])


def merge_paths(series_l, series_r, on):
    on_l, on_r = on

    frame_l = series_l.copy()
    if not isinstance(series_l, pd.DataFrame):
        frame_l = series_l.copy().to_frame(name="dat")

    frame_r = series_r.copy()
    if not isinstance(series_r, pd.DataFrame):
        frame_r = series_r.copy().to_frame(name="dat")

    target_l = None
    if on_l.startswith('left.') or on_l.startswith('right.'):
        parts = on_l.split('.')[:-2][::-1]
        the_ref = 'dat_' + '_'.join([ part[0] for part in parts ])
        target_l = frame_l[the_ref]
        on_l = '.'.join(on_l.split('.')[-2:])
    else:
        target_l = frame_l.dat

    target_r = None
    if on_r.startswith('left.') or on_r.startswith('right.'):
        parts = on_r.split('.')[:-2][::-1]
        the_ref = 'dat_' + '_'.join([ part[0] for part in parts ])
        target_r = frame_r[the_ref]
        on_r = '.'.join(on_r.split('.')[-2:])
    else:
        target_r = frame_r.dat

    if on_l.startswith('defs.'):
        cindex = int(on_l.replace('defs.', '')) - 1
        frame_l['key'] = target_l.str[16+40*cindex:24+40*cindex]
    elif on_l.startswith('gids.'):
        cindex = int(on_l.replace('gids.', '')) - 1
        frame_l['key'] = target_l.str[8+40*cindex:16+40*cindex]

    if on_r.startswith('defs.'):
        cindex = int(on_r.replace('defs.', '')) - 1
        frame_r['key'] = target_r.str[16+40*cindex:24+40*cindex]
    elif on_r.startswith('gids.'):
        cindex = int(on_r.replace('gids.', '')) - 1
        frame_r['key'] = target_r.str[8+40*cindex:16+40*cindex]
    
    frame_l.columns = frame_l.columns.map(lambda x: str(x) + '_l')
    frame_r.columns = frame_r.columns.map(lambda x: str(x) + '_r')

    return frame_l.merge(
        frame_r,
        how="inner",
        left_on="key_l",
        right_on="key_r"
    )


def get_results(result_set, labels):
    def _get_all_labels(cur):
        if isinstance(cur, list):
            res = []
            for i, l in enumerate(cur):
                if l is not None:
                    res.append(('dat', i + 1, l)) 
            return res
        
        return list(map(
            lambda x: (x[0] + '_l', x[1], x[2]),
            _get_all_labels(cur['left'])
        )) + list(map(
            lambda x: (x[0] + '_r', x[1], x[2]),
            _get_all_labels(cur['right'])
        ))
    
    results_map = {}
    for path, idx, label in _get_all_labels(labels):
        if path == 'dat':
            results_map[label] = get_texts_from_capture(result_set, idx)
        else:
            results_map[label] = get_texts_from_capture(result_set[path], idx)
    
    return results_map


def display_results(results, limit=10):
    for rs, results_map in enumerate(results):
        other_keys = [ k for k in results_map.keys() if k != '$match' ]
        for i, val in enumerate(results_map['$match']):
            if i > limit:
                print('Over {} matches. Stopping early.'.format(limit))
                break
            print('Match (RS#{}):\n```\n{}\n```'.format(
                rs + 1, val
            ))
            for j, k in enumerate(other_keys):
                print(' ' * j + '└─ {}: ```\n{}{}\n{}```'.format(
                    k,
                    ' ' * (j+3),
                    results_map[k][i].replace('\n', '\n' + ' ' * (j+3)),
                    ' ' * (j+3)
                ))
        
