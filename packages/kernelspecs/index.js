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
           name: k.name,
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
                  name: x,
                  resourceDir: path.join(d, x)
              }
          }))
        }
    })
}

const kernelsBound = Observable.bindCallback(kernels)
const getKernelResourcesBound = Observable.bindCallback(getKernelResources)

function asObservable() {
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
                    .publish()
                    .refCount()
  return o
}

function asPromise() {
  return asObservable()
           .reduce((kernels, kernel) => {
             kernels[kernel.name] = kernel;
              return kernels;
            }, {})
           .toPromise()
}

module.exports = {
  asPromise,
  asObservable,
}
