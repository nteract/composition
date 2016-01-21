const jp = require('jupyter-paths')
const path = require('path')
const fs = require('fs')

const Observable = require('rxjs/Rx').Observable

function getKernelResources(k, cb) {
    fs.readdir(k.resourceDir, (err, files) => {
        kernelJSONIndex = files.indexOf('kernel.json')
        if(err || kernelJSONIndex === -1) {
            cb({err: err})
            return
        }
        const kernelSpec = {
           language: k.language,
           files: files.map(x => path.join(k.resourceDir, x)),
           resources_dir: k.resourceDir
        }

        fs.readFile(path.join(k.resourceDir, files[kernelJSONIndex]), (err, data) => {
            if (err) {
                cb({err: err})
                return
            }
            try {
                kernelSpec['spec'] = JSON.parse(data)
                cb(kernelSpec)
            }
            catch(e) {
                cb({err: e})
            }
        })
    })
}

function kernels(d, cb) {
    fs.readdir(d, (err, files) => {
        if(err) {
          cb([])
        }
        else {
          cb(files.map(x => {
              return {
                  language: x,
                  resourceDir: path.join(d, x)
              }
          }))
        }
    })
}

const kernelsBound = Observable.bindCallback(kernels)
const getKernelResourcesBound = Observable.bindCallback(getKernelResources)

function kernelSpecs() {
  var potentialKernelDirs = jp.dataDirs().map(dir => path.join(dir, 'kernels'))
  var o = Observable.fromArray(potentialKernelDirs)
                    .flatMap(x => {return kernelsBound(x)})
                    .filter(x => x !== {})
                    .flatMap(x => {
                      return Observable.fromArray(x)
                    })
                    .flatMap(x => {
                      return getKernelResourcesBound(x)
                    })
                    .filter(x => !x.err)
                    .reduce((kernels, kernel) => {
                      kernels[kernel.language] = kernel;
                      delete kernel.language // Take out redundancy
                      return kernels;
                    }, {})
  return o.toPromise();
}

module.exports = {
  kernelSpecs,
}
