workflow "Try out test + build" {
  on = "push"
  resolves = ["GitHub Action for npm", "GitHub Action for npm-1"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@6309cd9"
  runs = "test"
}

action "GitHub Action for npm-1" {
  uses = "actions/npm@6309cd9"
  needs = ["GitHub Action for npm"]
  runs = "build:packages"
}
