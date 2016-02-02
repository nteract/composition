const jp = require('jupyter-paths');
const path = require('path');
const fs = require('fs');

/**
 * Converts a callback style call to a Promise
 * @param  {function} f
 * @param  {object[]} args    arguments to pass to the function when invoking it
 * @return {Promise<object>}  object returned by the function
 */
function callPromise(f, args) {
  return new Promise((resolve, reject) => f.apply(this, args.concat((err, x) => err ? reject(err) : resolve(x))));
}

/**
 * Get a kernel resources object 
 * @param  {object}   kernelInfo              description of a kernel
 * @param  {string}   kernelInfo.name         name of the kernel
 * @param  {string}   kernelInfo.resourceDir  kernel's resources directory
 * @return {Promise<object>}                  Promise for a kernelResources object
 */
function getKernelResources(kernelInfo) {
  return Promise.resolve(kernelInfo).then(kernelInfo => 
    callPromise(fs.readdir, [kernelInfo.resourceDir]).then(files => {
      var kernelJSONIndex = files.indexOf('kernel.json');
      if (kernelJSONIndex === -1) throw new Error('kernel.json not found');
      
      return callPromise(fs.readFile, [path.join(kernelInfo.resourceDir, 'kernel.json')]).then(data => ({
        name: kernelInfo.name,
        files: files.map(x => path.join(kernelInfo.resourceDir, x)),
        resources_dir: kernelInfo.resourceDir,
        spec: JSON.parse(data)
      }));
    })
  );
}

/**
 * Gets a list of kernelInfo objects for a given directory of kernels
 * @param  {string}   directory path to a directory full of kernels
return return     files.map(fileName => ({
      name: fileName,
      resourceDir: path.join(directory, fileName)
    }))
  );
}

/**
 * Get an array of kernelResources objects for the host environment
 * @return {Promise<object[]>} Promise for an array of kernelResources objects
 */
function kernelSpecs() {
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

module.exports = kernelSpecs;
