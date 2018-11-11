import { ajax } from "rxjs/ajax";
import querystring from "querystring";
import urljoin from "url-join";
import { ServerConfig, createAJAXSettings } from "./base";

const formURI = (path: string) => urljoin("/api/contents/", path);

const formCheckpointURI = (path: string, checkpointID: string) =>
  urljoin("/api/contents/", path, "checkpoints", checkpointID);

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
 * @param serverConfig  - The server configuration
 * @param path  - The path to the content
 *
 * @return An Observable with the request response
 */
export const remove = (serverConfig: ServerConfig, path: string) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(path), {
      method: "DELETE"
    })
  );

interface GetParams {
  type?: "file" | "directory" | "notebook";
  format?: "text" | "base64" | string;
  content?: 0 | 1;
}

/**
 * Creates an AjaxObservable for getting content at a path
 *
 * @param serverConfig  - The server configuration
 * @param path  - The content to fetch
 * @param params - type, format, content
 * @param params.type - file type, one of 'file', 'directory', 'notebook'
 * @param params.format - how file content should be returned, e.g. 'text', 'base64'
 * @param params.content - return content or not (0 => no content, 1 => content please)
 *
 * @return An Observable with the request response
 */
export const get = (
  serverConfig: ServerConfig,
  path: string,
  params: GetParams = {}
) => {
  let uri = formURI(path);
  const query = querystring.stringify(params);
  if (query.length > 0) {
    uri = `${uri}?${query}`;
  }
  return ajax(createAJAXSettings(serverConfig, uri));
};

/**
 * Creates an AjaxObservable for renaming a file.
 *
 * @param serverConfig  - The server configuration
 * @param path - The content to rename.
 * @param model -  ^^TODO
 * @return An Observable with the request response
 */
export const update = (
  serverConfig: ServerConfig,
  path: string,
  model: object
) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(path), {
      headers: {
        "Content-Type": "application/json"
      },
      method: "PATCH",
      body: model
    })
  );

/**
 * Creates an AjaxObservable for creating content
 *
 * @param serverConfig  - The server configuration
 * @param path  - The path to the content
 * @param model - ^^^^ TODO Above
 *
 * @return An Observable with the request response
 */
export const create = (
  serverConfig: ServerConfig,
  path: string,
  model: object
) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(path), {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: model
    })
  );

/**
 * Creates an AjaxObservable for saving the file in the location specified by
 * name and path in the model.
 *
 * @param serverConfig  - The server configuration
 * @param path - The content to
 * @param model - ^^^^ TODO above
 * @return An Observable with the request response
 */
export const save = (serverConfig: ServerConfig, path: string, model: object) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(path), {
      headers: {
        "Content-Type": "application/json"
      },
      method: "PUT",
      body: model
    })
  );

/**
 * Creates an AjaxObservable for listing checkpoints for a given file.
 * @param serverConfig  - The server configuration
 * @param path - The content containing checkpoints to be listed.
 * @return An Observable with the request response
 */
export const listCheckpoints = (serverConfig: ServerConfig, path: string) =>
  ajax(
    createAJAXSettings(serverConfig, formCheckpointURI(path, ""), {
      method: "GET"
    })
  );

/**
 * Creates an AjaxObservable for creating a new checkpoint with the current state of a file.
 * With the default Jupyter FileContentsManager, only one checkpoint is supported,
 * so creating new checkpoints clobbers existing ones.
 *
 * @param serverConfig  - The server configuration
 * @param path - The content containing the checkpoint to be created.
 * @return An Observable with the request response
 */
export const createCheckpoint = (serverConfig: ServerConfig, path: string) =>
  ajax(
    createAJAXSettings(serverConfig, formCheckpointURI(path, ""), {
      method: "POST"
    })
  );

/**
 * Creates an AjaxObservable for deleting a checkpoint for a given file.
 * @param  serverConfig  - The server configuration
 * @param  path - The content containing the checkpoint to be deleted.
 * @param  checkpoint_id - ID of checkpoint to be deleted.
 * @return An Observable with the request response
 */
export const deleteCheckpoint = (
  serverConfig: ServerConfig,
  path: string,
  checkpointID: string
) =>
  ajax(
    createAJAXSettings(serverConfig, formCheckpointURI(path, checkpointID), {
      method: "DELETE"
    })
  );

/**
 * Creates an AjaxObservable for restoring a file to a specified checkpoint.
 * @param serverConfig  - The server configuration
 * @param path - The content to restore to a previous checkpoint.
 * @param checkpoint_id - ID of checkpoint to be used for restoration.
 * @return An Observable with the request response
 */
export const restoreFromCheckpoint = (
  serverConfig: ServerConfig,
  path: string,
  checkpointID: string
) =>
  ajax(
    createAJAXSettings(serverConfig, formCheckpointURI(path, checkpointID), {
      method: "POST"
    })
  );
