import { ajax } from 'rxjs/observable/dom/ajax';

import { join as pathJoin } from 'path';

import {
  createAJAXSettings,
} from './base';

const querystring = require('querystring');

export function formURI(path) {
  return pathJoin('/api/contents/', path);
}

/**
 * Creates the AJAX settings for a call to get contents of a file or directory
 * Note that a get on path="/" is effectively a listing operation
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path - path to the file or directory
 * @param {string}  path  - The content to fetch
 * @param {Object}  params - type, format, content
 * @param {string}  params.type - file type, one of 'file', 'directory', 'notebook'
 * @param {string}  params.format - how file content should be returned, e.g. 'text', 'base64'
 * @param {number}  params.content - return content or not (0 => no content, 1 => content please)
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForGet(serverConfig, path, params) {
  // TODO: Does path need to be normalized?
  let uri = formURI(path);
  const query = querystring.stringify(params);
  if (query.length > 0) {
    uri = `${uri}?${query}`;
  }

  return createAJAXSettings(serverConfig, uri);
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
 * Creates the AJAX settings for creating a new file/directory
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The path to the content
 * @param {Object}  model - ^^^^
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForCreate(serverConfig, path, model) {
  const uri = formURI(path);

  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: model,
  };

  return createAJAXSettings(serverConfig, uri, opts);
}

/**
 * Creates the AJAX settings for a call to delete content
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The path to the content
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForRemove(serverConfig, path) {
  const uri = formURI(path);

  const opts = {
    method: 'DELETE',
  };

  return createAJAXSettings(serverConfig, uri, opts);
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
  return ajax(createSettingsForGet(serverConfig, path, params));
}

/**
 * Creates an AjaxObservable for creating content
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The path to the content
 * @param {Object}  model - ^^^^ TODO Above
 *
 * @return  {AjaxObserbable}  An Observable with the request response
 */
export function create(serverConfig, path, model) {
  return ajax(createSettingsForCreate(serverConfig, path, model));
}

/**
 * Creates an AjaxObservable for removing content
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  path  - The path to the content
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function remove(serverConfig, path) {
  return ajax(createSettingsForRemove(serverConfig, path));
}
