---
title: Callbacks
---

# Callbacks
When defining your plan, you have the flexibility to override the default behavior of Habitat in each part of the package building stage through a series of callbacks. To define a callback, simply create a shell function of the same name in your `plan.sh` file and then write your script. If you do not want to use the default callback behavior, you must override the callback and `return 0` in the function definition.

These callbacks are listed in the order that they are called by the package build script.

You can also use <a href="/docs/reference/build-variables">build variables</a> in your plans to place binaries, libraries, and files into their correct locations during package compilation or when running as a service.

Additionally, <a href="/docs/reference/utility-functions">utility functions</a> can be useful in your plan to help you build your package correctly. They are mostly used for debugging and building packages.

**do_begin()**
: Used to execute arbitrary commands before anything else happens. Note that at this phase of the build, no dependencies are resolved, the `$PATH` and environment is not set, and no external source has been downloaded. For a phase that is more completely set up, see the `do_before()` phase.

**do_begin_default()** 
: There is an empty default implementation of this callback.

**do_before()**
: At this phase of the build, the origin key has been checked for, all package dependencies have been resolved and downloaded, and the `$PATH` and environment are set, but this is just before any source downloading would occur (if `$pkg_source` is set). This could be a suitable phase in which to compute a dynamic version of a pacakge given the state of a Git repository, fire an API call, start timing something, etc.

**do_before_default()** 
: There is an empty default implementation of this callback. 

**do_download()**
: If `$pkg_source` is being used, download the software and place it in `$HAB_CACHE_SRC_PATH/$pkg_filename`. If the source already exists in the cache, verify that the checksum is what we expect, and skip the download. Delegates most of the implementation to the `do_default_download()` function.

**do_download_default()** 
: The default implementation is that the software specified in `$pkg_source` is downloaded, checksum-verified, and placed in `$HAB_CACHE_SRC_PATH/$pkg_filename`, which resolves to a path like `/hab/cache/src/filename.tar.gz`. You should override this behavior if you need to change how your binary source is downloaded, if you are not downloading any source code at all, or if you are cloning from git. If you do clone a repo from git, you must override **do_verify()** to return 0.

**do_verify()**
: If `$pkg_source` is being used, verify that the package we have in `$HAB_CACHE_SRC_PATH/$pkg_filename` has the `$pkg_shasum` we expect. Delegates most of the implementation to the `do_default_verify()` function.

If you do clone a repo from git, you must override **do_verify()** to return 0. 

**do_verify_default()**
: The default implementation tries to verify the checksum specified in the plan against the computed checksum after downloading the source tarball to disk. If the specified checksum doesn't match the computed checksum, then an error and a message specifying the mismatch will be printed to stderr. You should not need to override this behavior unless your package does not download any files.

**do_clean()**
: Clean up the remnants of any previous build job, ensuring it can't pollute out new output. Delegates most of the implementation to the `do_default_clean()` function.

**do_default_clean()**
: The default implementation removes the `HAB_CACHE_SRC_PATH/$pkg_dirname` folder in case there was a previously-built version of your package installed on disk. This ensures you start with a clean build environment.

**do_unpack()**
: If `$pkg_source` is being used, we take the `$HAB_CACHE_SRC_PATH/$pkg_filename` from the download step and unpack it,as long as the method of extraction can be determined. This takes place in the $HAB_CACHE_SRC_PATH directory. Delegates most of the implementation to the `do_default_unpack()` function.

**do_default_unpack()** 
: The default implementation extracts your tarball source file into `HAB_CACHE_SRC_PATH`. The supported archive extensions are: .tar, .tar.bz2, .tar.gz, .tar.xz, .rar, .zip, .Z, .7z. If the file archive could not be found or has an unsupported extension, then a message will be printed to stderr with additional information.

**do_prepare()**
: There is no default implementation of this callback. At this point in the build process, the tarball source has been downloaded, unpacked, and the build environment variables have been set, so you can use this callback to perform any actions before the package starts building, such as exporting variables, adding symlinks, and so on.

A step that exists to be overridden. Do what you need to do before we actually run the build steps. 

**do_default_prepare()** 
: There is an empty default implementation of this callback. 

**do_build()**
: You should override this behavior if you have additional configuration changes to make or other software to build and install as part of building your package. This step builds the software; assumes the GNU pattern. Delegates most of the implementation to the `do_default_build()` function.

**do_default_build()**
:The default implementation is to update the prefix path for the configure script to use `$pkg_prefix` and then run `make` to compile the downloaded source. This means the script in the default implementation does `./configure --prefix=$pkg_prefix && make`. 

**do_check()**
: Will run post-compile tests and checks, provided 2 conditions are true:

1. A `do_check()` function has been declared. By default, no such function
    exists, so Plan author must add one explicitly--there is no reasonably
    good default here.
1. A `$DO_CHECK` environment variable is set to some non-empty value. As
    tests can dramatically inflate the build time of a Plan, this has been
    left as an opt-in option.

Here's an example example of a vanilla Plan such as Sed:

 ```sh
 pkg_name=sed
 other Plan metadata...

 do_check() {
   make check
 }
 ```

**do_install()**
:  Installs the software. Delegates most of the implementation to the `do_default_install()` function. You should override this behavior if you need to perform custom installation steps, such as copying files from `HAB_CACHE_SRC_PATH` to specific directories in your package, or installing pre-built binaries into your package.

**do_install_default()** 
: The default implementation is to run `make install` on the source files and place the compiled binaries or libraries in `HAB_CACHE_SRC_PATH/$pkg_dirname`, which resolves to a path like `/hab/cache/src/packagename-version/`. It uses this location because of **do_build()** using the `--prefix` option when calling the configure script.

**do_build_config()**
: Copy the `./config` directory, relative to the Plan, to `$pkg_prefix/config`. Do the same with `default.toml`. Delegates most of the implementation to the `do_default_build_config()` function. 

Allows users to depend on a core plan and pull in its configuration but set their own unique configurations at build time.

**do_default_build_config()**
: Default implementation for the `do_build_config()` phase.

**do_build_service()** 
: Write out the `$pkg_prefix/run` file. If a file named `hooks/run` exists, we skip this step. Otherwise, we look for `$pkg_svc_run`, and use that. We assume that the binary used in the `$pkg_svc_run` command is set in the $PATH.

This will write a `run` script that uses `chpst` to run the command as the `$pkg_svc_user` and `$pkg_svc_group`. These are `hab` by default.

Delegates most of the implementation to the `do_default_build_server()` function.

**do_default_build_service()** 
: Default implementation of the `do_build_service()` phase. 

**do_strip()**
: You should override this behavior if you want to change how the binaries are stripped, which additional binaries located in subdirectories might also need to be stripped, or whether you do not want the binaries stripped at all.

**do_default_strip()** 
: The default implementation is to strip any binaries in `$pkg_prefix` of their debugging symbols. Goal of this step is to reduce our total size. 

**do_after()**
: At this phase, the package has been built, installed, stripped, but before the package metadata is written and the artifact is created and signed.

**do_default_after()** 
: There is an empty default implementation of this callback. 

**do_end()**
: A function for cleaning up after yourself, this is called after the package artifact has been created. You can use this callback to remove any temporary files or perform other post-build clean-up actions.

**do_default_end()**
: There is an empty default implementation of this callback. 
