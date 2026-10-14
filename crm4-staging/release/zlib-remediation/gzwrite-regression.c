#define _GNU_SOURCE
#include <assert.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <stdio.h>
#include <dlfcn.h>
#include "gzguts.h"
#ifdef NODE_ADDON
#include <node_api.h>
#endif
static const char *verify(void) {
 char file[]="/tmp/crm4-zlib-XXXXXX", bytes[256];
 int fd=mkstemp(file); assert(fd>=0); close(fd);
 fd=open(file,O_RDONLY); unlink(file); assert(fd>=0);
 gzFile stream=gzdopen(fd,"wbT"); assert(stream); assert(gzbuffer(stream,32)==0);
 memset(bytes,'x',sizeof(bytes)); assert(gzwrite(stream,bytes,sizeof(bytes))==0);
 gz_statep state=(gz_statep)stream;
 /* The approved fix must discard the failed direct input before any retry. */
 assert(state->strm.avail_in==0); assert(state->strm.next_in==state->in);
 gzclearerr(stream); assert(gzwrite(stream,bytes,sizeof(bytes))==0);
 assert(state->strm.avail_in==0); assert(state->strm.next_in==state->in);
 gzclose(stream);
 Dl_info info; assert(dladdr((void *)gzwrite,&info)); assert(info.dli_fname);
 return info.dli_fname;
}
#ifdef NODE_ADDON
static napi_value run(napi_env env,napi_callback_info info) {
 napi_value value; assert(napi_create_string_utf8(env,verify(),NAPI_AUTO_LENGTH,&value)==napi_ok);return value;
}
static napi_value init(napi_env env,napi_value exports) {
 napi_value fn;assert(napi_create_function(env,"verify",NAPI_AUTO_LENGTH,run,NULL,&fn)==napi_ok);
 assert(napi_set_named_property(env,exports,"verify",fn)==napi_ok);return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,init)
#else
int main(void){const char *library=verify();printf("CRM4 patched system gzwrite PASS: %s\n",library);assert(strstr(library,getenv("CRM4_EXPECT_LIBRARY")?getenv("CRM4_EXPECT_LIBRARY"):"/out/system/")!=NULL);return 0;}
#endif
