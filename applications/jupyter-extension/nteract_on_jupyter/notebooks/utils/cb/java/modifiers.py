from copy import deepcopy
from .querybuilder import CB
from .constraints import CBFieldIndex, CBAllowCastsAndParens, CBStepsAway


class CBAnyArgIs:
    _kind = 'Java.Mods.AnyArgIs'
    
    def __init__(self):
        self.kind = CBAnyArgIs._kind

    def __str__(self):
        return '$any_arg_is'

    @staticmethod
    def kind():
        return CBAnyArgIs._kind

    @staticmethod
    def rewrite(node, index=None, caller=None):
        new_root = CB('$virtual').with_constraints(
            CBAllowCastsAndParens(),
            CBFieldIndex('child') if index is None else CBFieldIndex('child', index),
            CBStepsAway(2, '=')
        )

        copy1 = deepcopy(node).remove_mod(CBAnyArgIs if caller is None else caller)
        
        if copy1.type == 'variable_declarator':
            new_root.nest(deepcopy(
                CB('variable_declarator_ref').nest(copy1).is_merge('defs', 'gids')
            ))
        elif copy1.type == 'formal_parameter':
            new_root.nest(deepcopy(
                CB('formal_parameter_ref').nest(copy1).is_merge('defs', 'gids')
            ))
        else:
            new_root.nest(deepcopy(copy1))
        
        return new_root


class CBFirstArgIs:
    _kind = 'Java.Mods.FirstArgIs'
    
    def __init__(self):
        self.kind = CBFirstArgIs._kind

    def __str__(self):
        return '$first_arg_is'

    @staticmethod
    def kind():
        return CBFirstArgIs._kind

    @staticmethod
    def rewrite(node):
        return CBAnyArgIs.rewrite(node, 1, CBFirstArgIs)


class CBSecondArgIs:
    _kind = 'Java.Mods.SecondArgIs'
    
    def __init__(self):
        self.kind = CBSecondArgIs._kind

    def __str__(self):
        return '$second_arg_is'

    @staticmethod
    def kind():
        return CBSecondArgIs._kind

    @staticmethod
    def rewrite(node):
        return CBAnyArgIs.rewrite(node, 2, CBSecondArgIs)


class CBTypeIs:
    _kind = 'Java.Mods.TypeIs'
    
    def __init__(self):
        self.kind = CBTypeIs._kind

    def __str__(self):
        return '$type_is'

    @staticmethod
    def kind():
        return CBTypeIs._kind

    @staticmethod
    def rewrite(node):
        return deepcopy(node).remove_mod(CBTypeIs).add_constraints(
            CBFieldIndex('type'), CBStepsAway(1, '=')
        )



class CBReceiverIs:
    _kind = 'Java.Mods.ReceiverIs'
    
    def __init__(self):
        self.kind = CBReceiverIs._kind

    def __str__(self):
        return '$receiver_is'

    @staticmethod
    def kind():
        return CBReceiverIs._kind

    @staticmethod
    def rewrite(node):
        new_root = CB('$virtual').with_constraints(
            CBAllowCastsAndParens(),
            CBFieldIndex('object'),
            CBStepsAway(1, '=')
        )

        copy1 = deepcopy(node).remove_mod(CBReceiverIs)
        
        if copy1.type == 'variable_declarator':
            new_root.nest(deepcopy(
                CB('variable_declarator_ref').nest(copy1).is_merge('defs', 'gids')
            ))
        elif copy1.type == 'formal_parameter':
            new_root.nest(deepcopy(
                CB('formal_parameter_ref').nest(
                    copy1.remove_mod(CBRefTo)
                ).is_merge('defs', 'gids').with_mod(CBRefTo())
            ))
        else:
            new_root.nest(deepcopy(copy1))
        
        return new_root


class CBRefTo:
    _kind = 'Java.Mods.RefTo'
    
    def __init__(self):
        self.kind = CBRefTo._kind

    def __str__(self):
        return '$ref_to'

    @staticmethod
    def kind():
        return CBRefTo._kind

    @staticmethod
    def rewrite(node):
        new_root = CB('$either')

        # Make our copies
        copy1 = deepcopy(node).remove_mod(CBRefTo)
        copy2 = deepcopy(node).without_mods().without_labels()

        new_copy2 = None
        if copy2.type == 'variable_declarator':
            new_copy2 = CB('variable_declarator_ref').nest(
                copy2
            ).is_merge('defs', 'gids')
        elif copy2.type == 'formal_parameter':
            new_copy2 = CB('formal_parameter_ref').nest(
                copy2
            ).is_merge('defs', 'gids')
        else:
            new_copy2 = copy2   
        
        # Either we (1) are directly reffing
        new_root.nest(copy1)
        
        # Or (2) we ref via an alias (var foo = ...)
        new_child = CB('variable_declarator_ref').nest(
            CB('variable_declarator').nest(
                CB('$virtual').with_constraints(
                    CBAllowCastsAndParens(),
                    CBFieldIndex('value'),
                    CBStepsAway(1, '=')
                ).nest(new_copy2)
            ).with_labels_from(node)
        ).is_merge('defs', 'gids')
        
        new_child.modifiers = copy1.modifiers
        new_root.bubbleup().nest(new_child)

        return new_root


ALL_MODS = [
    CBRefTo,
    CBAnyArgIs,
    CBReceiverIs,
    CBFirstArgIs,
    CBSecondArgIs,
    CBTypeIs
]
