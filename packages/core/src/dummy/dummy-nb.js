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
