## ElasticSearch Operations Manual

### Create a New Index

```
curl -XPOST http://<ES_HOST>/commuter -d @src/resources/commuter.es.mapping.json
```

### Update Alias

```
curl -XPOST http://<ES_HOST>/_aliases -d '
{
    "actions": [
        { "remove": {
            "alias": "commuter",
            "index": "<OLD_INDEX>"
        }},
        { "add": {
            "alias": "commuter",
            "index": "<NEW_INDEX>"
        }}
    ]
}'
```

### Delete Index

```
curl -XDELETE http://<ES_HOST>/commuter
```
