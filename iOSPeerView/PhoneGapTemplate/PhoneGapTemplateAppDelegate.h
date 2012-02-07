//
//  PhoneGapTemplateAppDelegate.h
//  PhoneGapTemplate
//
//  Created by Pavel Gorb on 9/4/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PhoneGapDelegate.h"

@interface PhoneGapTemplateAppDelegate : PhoneGapDelegate {
    
	NSString* invokeString;
}

// invoke string is passed to your app on launch, this is only valid if you 
// edit PhoneGapTemplate.plist to add a protocol
// a simple tutorial can be found here : 
// http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html

@property (copy)  NSString* invokeString;

@end
