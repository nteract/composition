## ROADMAP

This roadmap is organized into stages of development, leading towards a backend for (mostly) real-time collaboration.

### Stage I

- [x] List and Load notebooks from S3
  - [x] Bucket, etc. loaded from configuration (e.g. `COMMUTER_BUCKET=xyz`)
  - [x] Roles or Amazon environment variables automatically picked up (via `aws-sdk`)
- [x] Tree view of notebook content
- [x] Render page using notebook-preview

### Stage II

- [x] Save notebooks back to S3
- [x] Delete notebooks

### Stage III

- [x] Render page using nteract/nteract components
- [ ] Configurable base path for commuter app
- [ ] Start outlining an authentication and permissions strategy

### Stage IV

- [ ] Create server side in-memory model of notebook and transient models, push to clients
- [ ] Provide/use kernels from configured source (e.g. tmpnb.org, jupyterhub, or your private setup)
