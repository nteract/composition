# Roadmap for Real-time Collaboration

Research and data science teams use and share the notebook amongst
each other in order to complete their work. The notebook currently has 

## Real time session for notebooks

At a high level, we want the notebook and other in-memory models managed server side -- users will send and receive updates to the overall notebook session that will be replicated amongst the users.

![real time session](https://cloud.githubusercontent.com/assets/836375/24010956/93cb606c-0a36-11e7-9340-43cfc9355c96.png)

## Precursors

* [x] Build up our base application to have a central event bus (nteract/nteract uses redux)
* [ ] UI that is a pure reflection of the state of the document (components should not have state unless local)
