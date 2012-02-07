//

// 
//
//  Created by Jesse MacFadyen on 10-05-29.
//  Copyright 2010 Nitobi. All rights reserved.
//

#import "ChildBrowser.h"
#import "PhoneGapTemplateAppDelegate.h"

@implementation ChildBrowser

@synthesize childBrowser;

- (PhoneGapTemplateAppDelegate *)delegate {
    return (PhoneGapTemplateAppDelegate *)([UIApplication sharedApplication].delegate);
}

- (void) showWebPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options // args: url
{	
	if(childBrowser == NULL)
	{
		childBrowser = [[ ChildBrowserViewController alloc ] initWithScale:FALSE ];
		childBrowser.delegate = self;
	}
	
/* // TODO: Work in progress
	NSString* strOrientations = [ options objectForKey:@"supportedOrientations"];
	NSArray* supportedOrientations = [strOrientations componentsSeparatedByString:@","];
*/

	PhoneGapViewController* cont = (PhoneGapViewController*)[[self delegate] viewController];
	childBrowser.supportedOrientations = [cont supportedOrientations];
	[ cont presentModalViewController:childBrowser animated:YES ];
	
	NSString *url = (NSString*) [arguments objectAtIndex:1];
	

	[childBrowser loadURL:url  ];

}

-(void) close:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options // args: url
{
	[ childBrowser closeBrowser];
	
}

-(void) onClose
{
	NSString* jsCallback = [NSString stringWithFormat:@"Childbrowser._onClose();",@""];
	[ [self delegate].webView stringByEvaluatingJavaScriptFromString:jsCallback];
}

-(void) onOpenInSafari
{
	NSString* jsCallback = [NSString stringWithFormat:@"Childbrowser._onOpenExternal();",@""];
	[ [self delegate].webView stringByEvaluatingJavaScriptFromString:jsCallback];
}


-(void) onChildLocationChange:(NSString*)newLoc
{
	
	NSString* tempLoc = [NSString stringWithFormat:@"%@",newLoc];
	NSString* encUrl = [tempLoc stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	 
	NSString* jsCallback = [NSString stringWithFormat:@"Childbrowser._onLocationChange('%@');",encUrl];
	[ [self delegate].webView stringByEvaluatingJavaScriptFromString:jsCallback];

}




@end
