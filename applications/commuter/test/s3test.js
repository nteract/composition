// @flow
const assert = require("chai").assert;

describe("Test S3 service", function() {
  it("getObject returns notebook content", function() {
    const proxyquire = require("proxyquire");
    const s3Service = proxyquire("./../src/content-providers/s3/s3", {
      "aws-sdk/clients/s3": function() {
        return {
          getObject: function(params, cb) {
            cb(null, { Body: JSON.stringify("hello world") });
          }
        };
      }
    });
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" }
    });
    s3.getObject("dir/foo.ipynb", (err, data) => {
      assert.deepEqual(data.content, "hello world");
    });
  });

  it("listObjectsV2 correctly", function() {
    const proxyquire = require("proxyquire");
    const s3Service = proxyquire("./../src/content-providers/s3/s3", {
      "aws-sdk/clients/s3": function() {
        return {
          listObjectsV2: function(params, cb) {
            cb(null, {
              Contents: [
                {
                  Key: "dir/one/test.ipynb",
                  LastModified: "2016-05-25T17:26:26.000Z"
                }
              ],
              CommonPrefixes: [{ Prefix: "dir/one/" }]
            });
          }
        };
      }
    });

    const expectedData = {
      name: "one",
      path: "dir/one",
      type: "directory",
      writable: true,
      created: null,
      last_modified: null,
      mimetype: null,
      content: [
        {
          name: "test.ipynb",
          path: "dir/one/test.ipynb",
          type: "notebook",
          writable: true,
          created: null,
          last_modified: "2016-05-25T17:26:26.000Z",
          mimetype: null,
          content: null,
          format: null
        },
        {
          name: "one",
          path: "dir/one/",
          type: "directory",
          writable: true,
          created: null,
          last_modified: null,
          mimetype: null,
          content: null,
          format: null
        }
      ],
      format: "json"
    };
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "test" },
      s3PathDelimiter: "/"
    });
    s3.listObjects("dir/one", (err, data) => {
      assert.deepEqual(data, expectedData);
    });
  });

  it("strips base path from listObjectsV2 listings", function() {
    const proxyquire = require("proxyquire");
    const s3Service = proxyquire("./../src/content-providers/s3/s3", {
      "aws-sdk/clients/s3": function() {
        return {
          listObjectsV2: function(params, cb) {
            cb(null, {
              Contents: [
                {
                  Key: "s3BasePath/dir/one/test.ipynb",
                  LastModified: "2016-05-25T17:26:26.000Z"
                }
              ],
              CommonPrefixes: []
            });
          }
        };
      }
    });

    const expectedData = {
      name: "one",
      path: "dir/one",
      type: "directory",
      writable: true,
      created: null,
      last_modified: null,
      mimetype: null,
      content: [
        {
          name: "test.ipynb",
          path: "dir/one/test.ipynb",
          type: "notebook",
          writable: true,
          created: null,
          last_modified: "2016-05-25T17:26:26.000Z",
          mimetype: null,
          content: null,
          format: null
        }
      ],
      format: "json"
    };
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "test" },
      s3BasePrefix: "s3BasePath",
      s3PathDelimiter: "/"
    });
    s3.listObjects("dir/one", (err, data) => {
      assert.deepEqual(data, expectedData);
    });
  });

  it("deleteObject deletes the object", function() {
    const proxyquire = require("proxyquire");
    const s3Service = proxyquire("./../src/content-providers/s3/s3", {
      "aws-sdk/clients/s3": function() {
        return {
          deleteObject: function(params, cb) {
            cb(null, { DeleteMarker: "true", VersionId: "123" });
          }
        };
      }
    });
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" },
      s3PathDelimiter: "/"
    });
    s3.deleteObject("dir/foo.ipynb", (err, data) => {
      assert.deepEqual(data, { DeleteMarker: "true", VersionId: "123" });
    });
  });

  it("uploadObject writes a file to s3 bucket", function() {
    // $FlowFixMe
    const proxyquire = require("proxyquire");
    const expectedData = {
      ETag: '"dc328edabd19af595d98364de8c78c40"',
      VersionId: "lPHH5xnsJCLpKRzASI.oHuy0pEAXrAWf",
      Location: "https://foo.s3.amazonaws.com/dir/foo.ipynb",
      key: "dir/foo.ipynb",
      Key: "dir/foo.ipynb",
      Bucket: "foo"
    };
    const payload = { msg: "test" };

    const s3Service = proxyquire("./../src/content-providers/s3/s3", {
      "aws-sdk/clients/s3": function() {
        return {
          upload: function(params, cb) {
            cb(null, expectedData);
          }
        };
      }
    });
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" },
      s3PathDelimiter: "/"
    });
    s3.uploadObject("dir/foo.ipynb", payload, (err, data) => {
      assert.deepEqual(data, expectedData);
    });
  });
});
