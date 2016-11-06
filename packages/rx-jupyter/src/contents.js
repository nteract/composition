import { ajax } from 'rxjs/observable/dom/ajax';

import { join as pathJoin } from 'path';

import {
  createAJAXSettings,
} from './base';

const querystring = require('querystring');

function formURI(path) {
  return pathJoin('/api/contents/', path);
}

function formCheckpointURI(path, checkpointID) {
  return pathJoin('/api/contents/', path, 'checkpoints', checkpointID);
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
  * @param {Object}  serverConfig  - The server configuration
  * @param {string}  path  - The path to the content
  *
  * @return  {AjaxObservable}  An Observable with the request response
  */
export function remove(serverConfig, path) {
 const uri = formURI(path);
 const opts = {
   method: 'DELETE',
 };
 return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for getting content at a path
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The content to fetch
 * @param {Object}  params - type, format, content
 * @param {string}  params.type - file type, one of 'file', 'directory', 'notebook'
 * @param {string}  params.format - how file content should be returned, e.g. 'text', 'base64'
 * @param {number}  params.content - return content or not (0 => no content, 1 => content please)
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(serverConfig, path, params) {
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
 * @param  {[type]} serverConfig [description]
 * @param  {[type]} path         [description]
 * @param  {[type]} model        [description]
 * @return {[type]}              [description]
 */
export function rename(serverConfig, path, model) {
  const uri = formURI(path);
  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    body: model,
  }
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
export function create(serverConfig, path, model) {
  const uri = formURI(path);
  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: model,
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for saving the file in the location specified by name and path in the model.
 * @param  {[type]} serverConfig [description]
 * @param  {[type]} path         [description]
 * @param  {[type]} model        [description]
 * @return {[type]}              [description]
 */
export function saveOrUpload(serverConfig, path, model) {
  const uri = formURI(path);
  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: model,
  }
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for listing checkpoints for a given file.
 * @param  {[type]} serverConfig [description]
 * @param  {[type]} path         [description]
 * @return {[type]}              [description]
 */
export function listCheckpoints(serverConfig, path) {
  const uri = formCheckpointURI(path, '');
  const opts = {
    method: 'GET'
  }
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for creating a new checkpoint with the current state of a file.
 * With the default Jupyter FileContentsManager, only one checkpoint is supported,
 * so creating new checkpoints clobbers existing ones.
 *
 * @param  {[type]} serverConfig [description]
 * @param  {[type]} path         [description]
 * @return {[type]}              [description]
 */
export function createCheckpoint(serverConfig, path) {
  const uri = formCheckpointURI(path, '');
  const opts = {
    method: 'POST'
  }
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Creates an AjaxObservable for deleting a checkpoint for a given file.
 * @param  {[type]} serverConfig  [description]
 * @param  {[type]} path          [description]
 * @param  {[type]} checkpoint_id [description]
 * @return {[type]}               [description]
 */
export function deleteCheckpoint(serverConfig, path, checkpoint_id) {
  const uri = formCheckpointURI(path, checkpoint_id);
  const opts {
    method: 'DELETE',
  }
}

/**
 * Creates an AjaxObservable for restoring a file to a specified checkpoint.
 * @param  {[type]} serverConfig  [description]
 * @param  {[type]} path          [description]
 * @param  {[type]} checkpoint_id [description]
 * @return {[type]}               [description]
 */
export function restoreFromCheckpoint(serverConfig, path, checkpoint_id) {
  const uri = formCheckpointURI(path, checkpoint_id);
  const opts {
    method: 'POST',
  }
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}
