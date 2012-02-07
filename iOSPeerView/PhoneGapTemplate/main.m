//
//  main.m
//  PhoneGapTemplate
//
//  Created by Pavel Gorb on 9/4/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[])
{
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    int retVal = 0;
    UIDevice* thisDevice = [UIDevice currentDevice];
    if(thisDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad)
    {
        retVal = UIApplicationMain(argc, argv, nil, @"PhoneGapTemplateAppDelegate_iPad");
    }
    else
    {
        retVal = UIApplicationMain(argc, argv, nil, @"PhoneGapTemplateAppDelegate_iPhone");
    }
    [pool release];
    return retVal;
}
