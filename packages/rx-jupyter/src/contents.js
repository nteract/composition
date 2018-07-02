// @flow

import { ajax } from "rxjs/ajax";
import { Observable } from "rxjs";

import { createAJAXSettings } from "./base";

const querystring = require("querystring");
const urljoin = require("url-join");

function formURI(path: string): string {
  return urljoin("/api/contents/", path);
}

function formCheckpointURI(path: string, checkpointID: string): string {
  return urljoin("/api/contents/", path, "checkpoints", checkpointID);
}

/**
 * TODO: Explicit typing of the payloads for content
 *
 * name (string): Name of file or directory, equivalent to the last part of the path ,
 * path (string): Full path for file or directory ,
 * type (string): Type of content = ['directory', 'file', 'notebook']
 *                stringEnum:"directory", "file", "notebook",
 * writable (boolean): indicates whether the requester has permission to edit the file ,
 * created (string): Creation timestamp ,
 * last_modified (string): Last modified timestamp ,
 * mimetype (string): The mimetype of a file. If content is not null, and type is 'file',
 *                    this will contain the mimetype of the file, otherwise this will be null. ,
 * content (string): The content, if requested (otherwise null). Will be an array
 *                   if type is 'directory' ,
 * format (string): Format of content (one of null, 'text', 'base64', 'json')
 */

/**
 * Creates an AjaxObservable for removing content
 *
 * @param {Object} serverConfig  - The server configuration
 * @param {string} path  - The path to the content
 *
 * @return {AjaxObservable}  An Observable with the request response
 */
export function remove(serverConfig: Object, path: string): Observable<*> {
  const uri = formURI(path);
  const opts = {
    method: "DELETE"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for getting content at a path
 *
 * @param {Object} serverConfig  - The server configuration
 * @param {string} path  - The content to fetch
 * @param {Object} params - type, format, content
 * @param {string} params.type - file type, one of 'file', 'directory', 'notebook'
 * @param {string} params.format - how file content should be returned, e.g. 'text', 'base64'
 * @param {number} params.content - return content or not (0 => no content, 1 => content please)
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(
  serverConfig: Object,
  path: string,
  params: Object
): Observable<*> {
  let uri = formURI(path);
  const query = querystring.stringify(params);
  if (query.length > 0) {
    uri = `${uri}?${query}`;
  }
  return ajax(createAJAXSettings(serverConfig, uri));
}

/**
 * Creates an AjaxObservable for renaming a file.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param  {string} path - The content to rename.
 * @param  {Object} model -  ^^TODO
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function update(
  serverConfig: Object,
  path: string,
  model: Object
): Observable<*> {
  const uri = formURI(path);
  const opts = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "PATCH",
    body: model
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for creating content
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The path to the content
 * @param {Object}  model - ^^^^ TODO Above
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function create(
  serverConfig: Object,
  path: string,
  model: Object
): Observable<*> {
  const uri = formURI(path);
  const opts = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: model
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for saving the file in the location specified by
 * name and path in the model.
 * @param {Object} serverConfig  - The server configuration
 * @param {string} path - The content to
 * @param  {Object} model - ^^^^ TODO above
 * @return {AjaxObservable}  An Observable with the request response
 */
export function save(
  serverConfig: Object,
  path: string,
  model: Object
): Observable<*> {
  const uri = formURI(path);
  const opts = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "PUT",
    body: model
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for listing checkpoints for a given file.
 * @param {Object} serverConfig  - The server configuration
 * @param  {string} path - The content containing checkpoints to be listed.
 * @return {AjaxObservable}  An Observable with the request response
 */
export function listCheckpoints(
  serverConfig: Object,
  path: string
): Observable<*> {
  const uri = formCheckpointURI(path, "");
  const opts = {
    method: "GET"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for creating a new checkpoint with the current state of a file.
 * With the default Jupyter FileContentsManager, only one checkpoint is supported,
 * so creating new checkpoints clobbers existing ones.
 *
 * @param {Object} serverConfig  - The server configuration
 * @param {string} path - The content containing the checkpoint to be created.
 * @return {AjaxObservable}  An Observable with the request response
 */
export function createCheckpoint(
  serverConfig: Object,
  path: string
): Observable<*> {
  const uri = formCheckpointURI(path, "");
  const opts = {
    method: "POST"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for deleting a checkpoint for a given file.
 * @param  {Object} serverConfig  - The server configuration
 * @param  {string} path - The content containing the checkpoint to be deleted.
 * @param  {string} checkpoint_id - ID of checkpoint to be deleted.
 * @return {AjaxObservable}  An Observable with the request response
 */
export function deleteCheckpoint(
  serverConfig: Object,
  path: string,
  checkpointID: string
): Observable<*> {
  const uri = formCheckpointURI(path, checkpointID);
  const opts = {
    method: "DELETE"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for restoring a file to a specified checkpoint.
 * @param  {Object} serverConfig  - The server configuration
 * @param  {string} path - The content to restore to a previous checkpoint.
 * @param  {string} checkpoint_id - ID of checkpoint to be used for restoration.
 * @return {AjaxObservable}  An Observable with the request response
 */
export function restoreFromCheckpoint(
  serverConfig: Object,
  path: string,
  checkpointID: string
): Observable<*> {
  const uri = formCheckpointURI(path, checkpointID);
  const opts = {
    method: "POST"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}
