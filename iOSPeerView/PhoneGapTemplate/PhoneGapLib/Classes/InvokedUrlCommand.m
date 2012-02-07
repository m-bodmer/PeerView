/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */

#import "InvokedUrlCommand.h"
#import "JSON.h"

@implementation InvokedUrlCommand

@synthesize arguments;
@synthesize options;
@synthesize command;
@synthesize className;
@synthesize methodName;

+ (InvokedUrlCommand*) newFromUrl:(NSURL*)url
{
    /*
	 * Get Command and Options From URL
	 * We are looking for URLS that match yourscheme://<sessionKey>@<Class>.<command>/[<arguments>][?<dictionary>]
	 * We have to strip off the leading slash for the options.
	 *
	 * Note: We have to go through the following contortions because NSURL "helpfully" unescapes
	 * certain characters, such as "/" from their hex encoding for us. This normally wouldn't
	 * be a problem, unless your argument has a "/" in it, such as a file path.
	 */
	InvokedUrlCommand* iuc = [[InvokedUrlCommand alloc] init];
	
    iuc.command = [url host];
	
	NSString * fullUrl = [url description];
	int prefixLength = [[NSString stringWithFormat:@"%@://%@@%@/", [url scheme], [url user], [iuc command]] length]; //sessionKey is encoded in user credentials
	int qsLength = [[url query] length];
	int pathLength = [fullUrl length] - prefixLength;

	// remove query string length
    if (qsLength > 0)
		pathLength = pathLength - qsLength - 1; // 1 is the "?" char
	// remove leading forward slash length
	else if ([fullUrl hasSuffix:@"/"] && pathLength > 0)
		pathLength -= 1; // 1 is the "/" char 
	
    NSString* path = @"";
	if (pathLength > 0) {
		path = [fullUrl substringWithRange:NSMakeRange(prefixLength, pathLength)];
	}
	
	// Array of arguments
	NSMutableArray* arguments = [NSMutableArray arrayWithArray:[path componentsSeparatedByString:@"/"]];
	int i, arguments_count = [arguments count];
	for (i = 0; i < arguments_count; i++) {
		[arguments replaceObjectAtIndex:i withObject:[(NSString *)[arguments objectAtIndex:i]
													  stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
	}
	iuc.arguments = arguments;

	// Dictionary of options
	NSString* objectString = [[url query] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	SBJsonParser *jsonParser = [SBJsonParser new];
    id repr = [jsonParser objectWithString:objectString];
    if (!repr)
        NSLog(@"-JSONValue failed. Error trace is: %@", [jsonParser errorTrace]);
    [jsonParser release];
    iuc.options = (NSMutableDictionary*)repr;
	NSMutableArray* components = [NSMutableArray arrayWithArray:[iuc.command componentsSeparatedByString:@"."]];
	if (components.count >= 2) {
		iuc.methodName = [components lastObject];
		[components removeLastObject];
		iuc.className = [components componentsJoinedByString:@"."];
	}		
	
	return iuc;
}

- (void) dealloc
{
	[arguments release];
	[options release];
	[command release];
	[className release];
	[methodName release];
	
	[super dealloc];
}

@end
