Backup

```python
import utils
import regex
import pandas as pd
from contextlib import redirect_stdout

class CodeBookJavaUnion:
  def __init__(self, children):
    self.children = children
   
  def _primary_type_is(self, the_type):
    return self.children[0].primary_type.split('.')[0] == the_type
    
  def _clone(self):
    from copy import deepcopy
    return deepcopy(self)
  
  def _add_prefix(self, prefix):
    for child in self.children:
      child._add_prefix(prefix)
   
  def _add_suffix(self, suffix):
    for child in self.children:
      child._add_suffix(suffix)
  
  def receiver_is(self, other):
    if isinstance(other, CodeBookJava):
      other = [other]
    else:
      other = other.children
      
    results = []
    for child in self.children:
      for oth in other:
        results.append(child.receiver_is(oth))

    return CodeBookJavaUnion(results)
  
  def any_arg_is(self, other):
    if isinstance(other, CodeBookJava):
      other = [other]
    else:
      other = other.children
      
    results = []
    for child in self.children:
      for oth in other:
        results.append(child.any_arg_is(oth))

    return CodeBookJavaUnion(results)
 
  def queries(self):
    return self.children
    

class CodeBookJava:
  def __init__(self):
    self.paths = {}
    self.merges = {}
    self.merge_idx = 0
    self.type_idx = 0
    self.primary_type = None
    self.load_from = None
    
  def _parse_path(self, path):
    QUERY_LANG = r"^((\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?([a-z_0-9]+)?(\.f_[a-z_0-9]+)?(\[\d+\])?)+$"
    SUB_QUERY_LANG = r"(\{(>|<)?=?\d*\})(\^)?(\".*?\"=)?([a-z_0-9]+)?(\.f_[a-z_0-9]+)?(\[\d+\])?"
    QUERY_REGEX = regex.compile(QUERY_LANG)
    SUB_QUERY_REGEX = regex.compile(SUB_QUERY_LANG)
    
    if path[0] != '{':
        path = '{}' + path

    match = regex.match(QUERY_REGEX, path, version=regex.V1)
    params = []
    for i, sub_string in enumerate(match.captures(1)):
        sub_match = regex.match(SUB_QUERY_REGEX, sub_string, version=regex.V1)
        steps, _, negate, name, label, field, index = sub_match.groups()
        yield label, i
  
  def _set_primary(self, the_type):
    self.load_from = the_type
    self.type_idx += 1
    self.primary_type = the_type + '.{}'.format(self.type_idx)
    self.paths[self.primary_type] = the_type
   
  def _primary_type_is(self, the_type):
    return self.primary_type.split('.')[0] == the_type
  
  def _add_prefix(self, prefix):
    self.paths[self.primary_type] = prefix + self.paths[self.primary_type]
   
  def _add_suffix(self, suffix):
    self.paths[self.primary_type] = self.paths[self.primary_type] + suffix
    
  def _clone(self):
    from copy import deepcopy
    return deepcopy(self)
   
  def _add_merge(self, left, right, lload, rload, lkey, rkey):
    # So what if the thing we want to merge w/ is _already_ in a merge!?
    # I feel like this is what's currently holding me back...
    self.merge_idx += 1

    for key, (ml, mr, _, _, mlk, mrk) in self.merges.items():
      if left == ml:
        left = key
        lkey = 'left.' + lkey
        break
      if left == mr:
        left = key
        lkey = 'right.' + lkey
        break
      if right == ml:
        right = key
        rkey = 'left.' + rkey
        break
      if right == mr:
        right = key
        rkey = 'right.' + rkey
        break
      
    self.merges['m{}'.format(self.merge_idx)] = (
      left, right, lload, rload, lkey, rkey
    )
   
  def _combine_paths(self, other):
    self.paths.update(other.paths)
  
  def new(self, name=None):
    self._set_primary('object_creation_expression')
    if name is not None:
      self._add_prefix('"{}"='.format(name))
    return self._clone()
 
  def any_arg_is(self, other):
    if self._primary_type_is('object_creation_expression') or self._primary_type_is('method_invocation'):
      temp = other._clone()
      temp._add_suffix('.f_child{=2}')
      temp._add_suffix(self.paths[self.primary_type])
      return temp
    else:
      assert False, "Can't handle {}.any_arg_is({})".format(self.primary_type, other.primary_type)
    return self
  
  def calls(self, name=None):
    self._set_primary('method_invocation')
    if name is not None:
      self._add_prefix('"{}"='.format(name))
    return self._clone()
 
  def receiver_is(self, other):
    if other._primary_type_is('formal_parameter'):
      self._combine_paths(other)
      self._add_prefix('formal_parameter_ref.f_object{=1}')
      self.load_from = 'formal_parameter_ref'
      self._add_merge(
        other.primary_type, self.primary_type, other.load_from, self.load_from, 'gids.2', 'defs.1'
      )
      return self
    elif other._primary_type_is('variable_declarator_ref'):
      self._combine_paths(other)
      self._add_prefix('variable_declarator_ref.f_object{=1}')
      self.load_from = other.load_from
      self._add_merge(
        other.primary_type, self.primary_type, other.load_from, self.load_from, 'gids.2', 'defs.1'
      )
      return self
    elif other._primary_type_is('method_invocation'):
      self._add_prefix(other.children[0].paths[other.children[0].primary_type]) # TODO: fix
      self._add_prefix('.f_object{=1}')
      self.load_from = 'method_invocation'
      return self
    else:
      assert False, "Can't handle {}.receiver_is({})".format(self.primary_type, other.primary_type)
    return self

  def ref(self):
    if self._primary_type_is('method_invocation'):
      # We can ref direct, or via variable
      copy = self._clone()
      copy._add_suffix('.f_value{=1}variable_declarator')
      copy._set_primary('variable_declarator_ref')
      copy._add_merge(
        self.primary_type, copy.primary_type, self.load_from, copy.load_from, 'gids.3', 'defs.1'
      )
      return CodeBookJavaUnion([ self, copy ])
      
    return self
  
  def method_params(self, name=None, type=None):
    self._set_primary('formal_parameter')
    if name is not None:
      self._add_prefix('"{}"='.format(name))
    if type is not None:
      self._add_prefix('"{}"=type_identifier{{=1}}'.format(type))
      self.load_from = 'type_identifier'
    return self._clone()
  
  def _execute(self):
    
    state = {}
    disp = {}
    last = None
    
    print(self.merges)
    print(self.paths)
    for key, (lref, rref, lload, rload, lkey, rkey) in self.merges.items():
      disp[key] = {}
      disp['t1'] = {}
      disp['t2'] = {}
      ml = lref
      mr = rref
      
      print(key, lref, rref, lload, rload, lkey, rkey)
      print(self.paths[lref] if lref not in self.merges else self.merges[lref])
      print(self.paths[rref] if rref not in self.merges else self.merges[rref])
      
      if lref not in self.merges:
        for the_type, idx in self._parse_path(self.paths[lref]):
          disp['t1'][the_type] = ('dat', idx)
        state['t1'] = utils.query_java(lload, self.paths[lref])
        ml = 't1'
      if rref not in self.merges:
        for the_type, idx in self._parse_path(self.paths[rref]):
          disp['t2'][the_type] = ('dat', idx)
        state['t2'] = utils.query_java(rload, self.paths[rref])
        mr = 't2'

      for the_type, (p, i) in disp[ml].items():
         disp[key][the_type] = (p + '_l', i)
      for the_type, (p, i) in disp[mr].items():
         disp[key][the_type] = (p + '_r', i)
      state[key] = utils.merge_paths(state[ml], state[mr], on=(lkey, rkey))
      last = key
      
    outputs = [] 
    for the_type, (key, idx) in disp[last].items():
      unpacked = zip(
        state[last][key].str[0:8],
        state[last][key].str[8+idx*40:16+idx*40],
        state[last][key].str[16+idx*40:24+idx*40],
        state[last][key].str[24+idx*40:32+idx*40],
        state[last][key].str[32+idx*40:36+idx*40],
        state[last][key].str[36+idx*40:40+idx*40],
      )
      for midx, (b_fid, b_gid, b_def, b_name, b_start, b_end) in enumerate(unpacked):
        if midx >= len(outputs):
          outputs.append({})
        outputs[midx].update({the_type: {
          "fid": int.from_bytes(b_fid, byteorder="little", signed=True),
          "gid": int.from_bytes(b_gid, byteorder="little", signed=True),
          "def_id": int.from_bytes(b_def, byteorder="little", signed=True),
          "name_hash": int.from_bytes(b_name, byteorder="little", signed=True),
          "start_idx": int.from_bytes(b_start, byteorder="little", signed=False),
          "end_idx": int.from_bytes(b_end, byteorder="little", signed=False)
        }})
        try:
          outputs[midx][the_type]['text'] = utils.get_text_fragement(
            outputs[midx][the_type]['fid'],
            outputs[midx][the_type]['start_idx'],
            outputs[midx][the_type]['end_idx']
          )
        except:
          outputs[midx][the_type]['text'] = '[Failed to decode.]'
    
    return outputs, state
 
  def queries(self):
    return [ self ]
 

def execute(query, quiet=True):
  results = []
  for q in query.queries():
    outputs = []
    if not quiet:
      outputs, _ = q._execute()
    else:
      with redirect_stdout(None):
        outputs, _ = q._execute()
    results.extend(outputs)
  return results


def display_matches(results, matched, because_1=None, because_2=None):
  for i, res in enumerate(results):
    print('Match [{}]: `{}`'.format(i+1, res[matched]['text']))
    if because_1 is not None and because_1 in res:
      print('└──Because: `{}`'.format(res[because_1]['text']))
    if because_2 is not None and because_2 in res:
      print('  └──Because: `{}`'.format(res[because_2]['text']))
    print()

cb = CodeBookJava()
```
