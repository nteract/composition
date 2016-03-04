# Sagas

Saga's are a control flow mechanism for composing (potentially complex) side-effects. They keep managing external services out of your reducers, because that's not what your reducers are for. Because they use generators, you can `next()` step through them when testing.
