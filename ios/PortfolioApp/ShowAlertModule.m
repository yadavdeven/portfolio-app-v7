//
//  ShowAlertModule.m
//  PortfolioApp
//
//  Created by Devendra Yadav on 05/08/26.
//

#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

// iOS counterpart of the Android `ShowAlertModule`.
//
// Pure Objective-C module — no .h and no bridging header needed. Declaring the
// @interface here in the .m is the standard shape for React Native modules,
// since nothing else in the app imports this type.
@interface ShowAlertModule : NSObject <RCTBridgeModule>
@end

@implementation ShowAlertModule

// Registers the class with React Native at launch. With no argument the JS-facing
// name defaults to the class name → NativeModules.ShowAlertModule, which is what
// src/native/ShowAlert.ts looks up and what Android's getName() returns.
RCT_EXPORT_MODULE();

// Modules are initialised on a background queue unless this returns YES. We touch
// UIKit only inside the exported method (dispatched to main there), never in init,
// so NO is correct — and it keeps startup off the main thread.
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

// RCT_EXPORT_METHOD is the ObjC equivalent of Android's @ReactMethod: it makes the
// method visible to JS. The return type must be void — a legacy module hands values
// back only via a promise or callback parameter, never by returning.
RCT_EXPORT_METHOD(showAlert:(NSString *)name) {
  // Exported methods run on the module's own background queue, and UIKit is
  // main-thread only. This is the iOS counterpart of Android's
  // UiThreadUtil.runOnUiThread.
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = [self topViewController];

    // Nothing on screen to present from (app backgrounded, window torn down).
    // Drop the alert, mirroring Android's null-currentActivity guard.
    if (presenter == nil) {
      return;
    }

    UIAlertController *alert = [UIAlertController
        alertControllerWithTitle:@"Greeting"
                         message:[NSString stringWithFormat:@"Hello %@", name]
                  preferredStyle:UIAlertControllerStyleAlert];

    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleDefault
                                            handler:nil]];

    [presenter presentViewController:alert animated:YES completion:nil];
  });
}

/// Walks from the key window's root to the top-most presented controller.
/// Presenting on a controller that is already covered fails silently on iOS,
/// so this has to be the deepest one — e.g. when a modal is already open.
- (UIViewController *)topViewController {
  UIWindow *keyWindow = nil;

  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    for (UIWindow *window in ((UIWindowScene *)scene).windows) {
      if (window.isKeyWindow) {
        keyWindow = window;
        break;
      }
    }
    if (keyWindow != nil) {
      break;
    }
  }

  UIViewController *top = keyWindow.rootViewController;
  while (top.presentedViewController != nil) {
    top = top.presentedViewController;
  }
  return top;
}

@end
