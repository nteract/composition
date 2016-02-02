const jp = require('jupyter-paths');
const path = require('path');
const fs = require('fs');

const Observable = require('rxjs/Rx').Observable;

/**
 * Get a kernel resources object 
 * @param  {object}   kernelInfo              description of a kernel
 * @param  {string}   kernelInfo.name         name of the kernel
 * @param  {string}   kernelInfo.resourceDir  kernel's resources directory
 * @return {Promise<object>}                  Promise for a kernelResources object
 */
function getKernelResources(kernelInfo) {
  return new Promise(function(resolve, reject) {
    fs.readdir(kernelInfo.resourceDir, (err, files) => {
      if (err) {
        reject(error);
        return;
      }

      var kernelJSONIndex = files.indexOf('kernel.json');
      if (kernelJSONIndex === -1) {
        reject(new Error('kernel.json not found'));
        return;
      }

      fs.readFile(path.join(kernelInfo.resourceDir, files[kernelJSONIndex]), (err, data) => {
        if (err) {
          reject(error);
          return;
        }

        // Return the kernelSpec
        resolve({
          name: kernelInfo.name,
          files: files.map(x => path.join(kernelInfo.resourceDir, x)),
          resources_dir: kernelInfo.resourceDir,
          spec: JSON.parse(data)
        });
      });
    });
  });
}

/**
 * Gets a list of kernelInfo objects for a given directory of kernels
 * @param  {string}   directory path to a directory full of kernels
 * @return {Promise<object[]>}  Promise for an array of kernelInfo objects
 */
function getKernelInfos(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.map(fileName => ({
          name: fileName,
          resourceDir: path.join(directory, fileName)
        })));
      }
    });
  });
}

/**
 * Get an array of kernelResources objects for the host environment
 * @return {Promise<object[]>} Promise for an array of kernelResources objects
 */
function asPromise() {
  return jp.dataDirs({ withSysPrefix: true }).then(dirs => {
    return Promise.all(dirs
      .map(dir => getKernelInfos(dir)) // get kernel infos for each directory
      .reduce((a, b) => a.concat(b)) // flatten the results into one array
      .map(a => a.catch())) // ignore kernelInfo related errors
      .map(a => getKernelResources(a)) // convert kernelInfo -> kernelResources
      .map(a => a.catch()) // ignore kernelResources related errors
      .filter(a => a); // remove null/undefined kernelResources
  });
}

/**
 * Get an observable of kernelResources objects
 * @return {Observable<object>} observable of kernelResources objects
 */
function asObservable() {
  return Observable
    .fromPromise(asPromise())
    .flatMap(x => Observable.fromArray(x))
    .publish()
    .refCount();
}

module.exports = {
  asPromise,
  asObservable,
};
