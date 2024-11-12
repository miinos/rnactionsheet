
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRnactionsheetSpec.h"

@interface Rnactionsheet : NSObject <NativeRnactionsheetSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Rnactionsheet : NSObject <RCTBridgeModule>
#endif

@end
