

class Infixer:
    def __init__(self, function):
        self.function = function

    def __ror__(self, other):
        return Infixer(
            lambda x, self=self, other=other: self.function(other, x)
        )

    def __or__(self, other):
        return self.function(other)

    def __rlshift__(self, other):
        return Infixer(
            lambda x, self=self, other=other: self.function(other, x)
        )

    def __rshift__(self, other):
        return self.function(other)

    def __call__(self, value1, value2):
        return self.function(value1, value2)
