// @flow
const s3Service = require("./../src/content-providers/s3/s3");
jest.mock("aws-sdk/clients/s3");
const awsMock = require("aws-sdk/clients/s3");

describe("Test S3 service", () => {
  test("getObject returns notebook content", done => {
    awsMock.prototype.getObject = function(params, cb) {
      cb(null, { Body: JSON.stringify("hello world") });
    };
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" }
    });
    s3.getObject("dir/foo.ipynb", (err, data) => {
      expect(data.content).toEqual("hello world");
      done();
    });
  });
  test("listObjectsV2 correctly", done => {
    awsMock.prototype.listObjectsV2 = function(params, cb) {
      cb(null, {
        Contents: [
          {
            Key: "dir/one/test.ipynb",
            LastModified: "2016-05-25T17:26:26.000Z"
          }
        ],
        CommonPrefixes: [{ Prefix: "dir/one/" }]
      });
    };

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
      expect(data).toEqual(expectedData);
      done();
    });
  });

  test("strips base path from listObjectsV2 listings", done => {
    awsMock.prototype.listObjectsV2 = function(params, cb) {
      cb(null, {
        Contents: [
          {
            Key: "s3BasePath/dir/one/test.ipynb",
            LastModified: "2016-05-25T17:26:26.000Z"
          }
        ],
        CommonPrefixes: []
      });
    };

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
      expect(data).toEqual(expectedData);
      done();
    });
  });

  test("deleteObject deletes the object", done => {
    awsMock.prototype.deleteObject = function(params, cb) {
      cb(null, { DeleteMarker: "true", VersionId: "123" });
    };
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" },
      s3PathDelimiter: "/"
    });
    s3.deleteObject("dir/foo.ipynb", (err, data) => {
      expect(data).toEqual({ DeleteMarker: "true", VersionId: "123" });
      done();
    });
  });

  test("uploadObject writes a file to s3 bucket", done => {
    const expectedData = {
      ETag: '"dc328edabd19af595d98364de8c78c40"',
      VersionId: "lPHH5xnsJCLpKRzASI.oHuy0pEAXrAWf",
      Location: "https://foo.s3.amazonaws.com/dir/foo.ipynb",
      key: "dir/foo.ipynb",
      Key: "dir/foo.ipynb",
      Bucket: "foo"
    };
    const payload = { msg: "test" };

    awsMock.prototype.upload = function(params, cb) {
      cb(null, expectedData);
    };
    const s3 = s3Service.createS3Service({
      s3: { Bucket: "foo" },
      s3PathDelimiter: "/"
    });
    s3.uploadObject("dir/foo.ipynb", payload, (err, data) => {
      expect(data).toEqual(expectedData);
      done();
    });
  });
});
