// @flow
const getInitialState = () => ({
  ui: {
    repo: "binder-examples/jupyter-stacks",
    gitref: "master",
    source: `from vdom import h1, p, img, div, span

def fancy(word):
    '''component to make a simple word ✨ fancy ✨'''
    colors = ['#FA8AAE', '#8AE7FA', '#FAFA8A', '#8AFA8A']

    return [
        span(letter, style=dict(color=colors[idx % len(colors)]), key=idx)
        for (idx, letter) in enumerate(word)
    ]


div(h1('Welcome to ', fancy('play'), '!'),
    p('Run Python code via Binder & Jupyter'),
    img(src="https://bit.ly/storybot-vdom"),
    p('Change the code, click ',
      span(
          "▶ Run",
          style=dict(color="white", backgroundColor="black", padding="10px")),
      ' Up above'))
`,
    showPanel: false,
    currentServerId: "",
    currentKernelName: "",
    platform: ""
  },
  entities: {
    serversById: {}
  }
});

export default getInitialState;
