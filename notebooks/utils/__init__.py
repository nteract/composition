from .timing import timing
from .cbjava import decode_path as decode_java_path
from .cbjava import type_to_idx as java_type_to_idx

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

__F_CACHE = {}
__DATA = None
__T_CACHE = {}

QUERY_LANG = r"^((\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?([a-z_0-9]+)?(\.f_[a-z_0-9]+)?(\[\d+\])?)+$"
SUB_QUERY_LANG = r"(\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?([a-z_0-9]+)?(\.f_[a-z_0-9]+)?(\[\d+\])?"
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

    for i, sub_string in enumerate(match.captures(1)):
        sub_match = regex.match(SUB_QUERY_REGEX, sub_string, version=regex.V1)
        steps, _, negate, name, label, field, index = sub_match.groups()

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
        print(target_func, params)

    return target_func, params, builder


def get_text_from_capture(res, cidx):
    offset = 32 + (cidx - 1) * 40
    return get_text_fragement(
        int.from_bytes(res[0:8], signed=True, byteorder="little"),
        int.from_bytes(res[offset+0:offset+4], signed=False, byteorder="little"),
        int.from_bytes(res[offset+4:offset+8], signed=False, byteorder="little")
    )


def query_java(root_type, query_string, extra="file_id", name_is=None, name_regex=None):
    global __DATA, __T_CACHE

    as_table = None
    proj = None

    if __DATA is None:
        with timing('  + Discovered'):
            print('Discovering data...')
            __DATA = ds.dataset('/data/parquet', format='parquet', partitioning='hive')

    if root_type not in __T_CACHE:
        with timing('  + Loaded'):
            print('Loading data...')
            
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

    with timing('  + Prepared'):
        print('Preapring query...')
        target_func, params, builder = parse_query(query_string, java_type_to_idx)
        
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

    with timing('  + Ran `{}`'.format(query_string)):
        print('Running query...')
        total = []
        for record_batch in as_table.to_batches():
            res, = proj.evaluate(record_batch)
            temp = res.to_pandas()
            total.append(temp[temp != b''])
        final = pd.concat(total)

        return final


def merge_paths(series_l, series_r, on):
    on_l, on_r = on

    frame_l = series_l.to_frame(name="values_l")
    frame_r = series_r.to_frame(name="values_r")

    if on_l.startswith('defs.'):
        cindex = int(on_l.replace('defs.', '')) - 1
        frame_l['key'] = frame_l.values_l.str[16+40*cindex:24+40*cindex]
    elif on_l.startswith('gids.'):
        cindex = int(on_l.replace('gids.', '')) - 1
        frame_l['key'] = frame_l.values_l.str[8+40*cindex:16+40*cindex]

    if on_r.startswith('defs.'):
        cindex = int(on_r.replace('defs.', '')) - 1
        frame_r['key'] = frame_r.values_r.str[16+40*cindex:24+40*cindex]
    elif on_r.startswith('gids.'):
        cindex = int(on_r.replace('gids.', '')) - 1
        frame_r['key'] = frame_r.values_r.str[8+40*cindex:16+40*cindex]

    return frame_l.merge(
        frame_r,
        how="inner",
        on="key"
    )
