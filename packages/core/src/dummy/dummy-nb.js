// @flow
/* eslint-disable no-multi-str */
import { fromJS } from "@nteract/commutable";

export const dummy =
  '{"cells":[{"cell_type":"markdown","metadata":{},\
"source":["## The Notable Nteract Notebook\\n","\\n","**It\'s a notebook!**\\n"]},\
{"cell_type":"code","execution_count":11,"metadata":{"collapsed":false},\
"outputs":[{"data":{"text/plain":["<h1>Multiple</h1>"],\
"text/plain":["<IPython.core.display.HTML object>"]},"metadata":{},"output_type":"display_data"}],\
"source":["import IPython\\n","\\n","from IPython.display import HTML\\n",\
"from IPython.display import Markdown\\n","from IPython.display import display\\n","\\n",\
"display(HTML(\'<h1>Multiple</h1>\'))\\n","display(HTML(\'<p>Display Elements</p>\'))\\n",\
"display(Markdown(\'**awesome**\'))\\n","\\n","print(\'hey\')\\n","42"]}],\
"metadata":{"kernelspec":{"display_name":"Python 3","language":"python","name":"python3"},\
"language_info":{"codemirror_mode":{"name":"ipython","version":3},"file_extension":".py",\
"mimetype":"text/x-python","name":"python","nbconvert_exporter":"python",\
"pygments_lexer":"ipython3","version":"3.5.1"}},"nbformat":4,"nbformat_minor":0}';

export const dummyJSON = JSON.parse(dummy);

export const dummyCommutable = fromJS(dummyJSON);

export const bigDummyJSON = {
  cells: [
    {
      cell_type: "markdown",
      source: [
        "# This is an example notebook\n",
        "\n",
        "## Used for test purposes...\n",
        "\nThe idea is to have enough real data in here to make a non-trivial NB."
      ],
      metadata: {
        trusted: false
      }
    },
    {
      cell_type: "code",
      source: ["import math\n", "import IPython.display"],
      outputs: [],
      execution_count: 17,
      metadata: {
        trusted: false
      }
    },
    {
      cell_type: "markdown",
      source: [
        "Here, we intersperse markdown to make sure it isn't simply a bunch of consecutive code blocks."
      ],
      metadata: {
        collapsed: false,
        outputHidden: false,
        inputHidden: false
      }
    },
    {
      cell_type: "code",
      source: [
        "data = [round(math.sin(i*2*math.pi/10)*100) + 100 for i in range(0, 10)]"
      ],
      outputs: [],
      execution_count: 23,
      metadata: {
        collapsed: false,
        outputHidden: false,
        inputHidden: false
      }
    },
    {
      cell_type: "markdown",
      source: [
        "Finally, we even display some HTML in the output to ensure that we have more than simple text output."
      ],
      metadata: {}
    },
    {
      cell_type: "code",
      source: [
        'bars = "".join([\'<div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: {}px;"></div>\'.format(datum) for datum in data])\n',
        "IPython.display.HTML(bars)"
      ],
      outputs: [
        {
          output_type: "execute_result",
          execution_count: 33,
          data: {
            "text/plain": ["<IPython.core.display.HTML object>"],
            "text/html": [
              '<div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 100px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 159px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 195px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 195px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 159px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 100px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 41px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 5px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 5px;"></div><div style="display: inline-block; margin: 5px; background-color: #0074D9; width: 20px; height: 41px;"></div>'
            ]
          },
          metadata: {}
        }
      ],
      execution_count: 33,
      metadata: {
        collapsed: false,
        outputHidden: false,
        inputHidden: false
      }
    },
    {
      cell_type: "code",
      source: [],
      outputs: [],
      execution_count: 28,
      metadata: {
        collapsed: false,
        outputHidden: false,
        inputHidden: false
      }
    },
    {
      cell_type: "markdown",
      source: [
        "^^ Add an empty code cell above and an empty markdown cell below for kicks. Et, voila."
      ],
      metadata: {}
    },
    {
      cell_type: "markdown",
      source: [],
      metadata: {}
    }
  ],
  metadata: {
    kernelspec: {
      display_name: "Python 3",
      language: "python",
      name: "python3"
    },
    language_info: {
      name: "python",
      version: "3.6.0",
      mimetype: "text/x-python",
      codemirror_mode: {
        name: "ipython",
        version: 3
      },
      pygments_lexer: "ipython3",
      nbconvert_exporter: "python",
      file_extension: ".py"
    }
  },
  nbformat: 4,
  nbformat_minor: 2
};

export const bigDummyCommutable = fromJS(bigDummyJSON);

export const bigDummy = JSON.stringify(bigDummyJSON);
