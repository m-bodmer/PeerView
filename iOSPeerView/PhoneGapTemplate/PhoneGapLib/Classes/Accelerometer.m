/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import "Accelerometer.h"

@implementation PGAccelerometer

// defaults to 100 msec
#define kAccelerometerInterval      100 
// max rate of 40 msec
#define kMinAccelerometerInterval    40  
// min rate of 1/sec
#define kMaxAccelerometerInterval   1000




- (void)start:(NSMutableArray*)arguments
	 withDict:(NSMutableDictionary*)options
{
	
	NSTimeInterval desiredFrequency_num = kAccelerometerInterval;
	
	if ([options objectForKey:@"frequency"]) 
	{
		int nDesFreq = [(NSString *)[options objectForKey:@"frequency"] intValue];
		// Special case : returns 0 if int conversion fails
		if(nDesFreq == 0)
		{
			nDesFreq = desiredFrequency_num;
		}
		else if(nDesFreq < kMinAccelerometerInterval) 
		{
			nDesFreq = kMinAccelerometerInterval;
		}
		else if(nDesFreq > kMaxAccelerometerInterval)
		{
			nDesFreq = kMaxAccelerometerInterval;
		}
		desiredFrequency_num = nDesFreq;
	}
	UIAccelerometer* pAccel = [UIAccelerometer sharedAccelerometer];
	// accelerometer expects fractional seconds, but we have msecs
	pAccel.updateInterval = desiredFrequency_num / 1000;
	if(!_bIsRunning)
	{
		pAccel.delegate = self;
		_bIsRunning = YES;
	}
}


- (void)stop:(NSMutableArray*)arguments
	withDict:(NSMutableDictionary*)options
{
	UIAccelerometer*  theAccelerometer = [UIAccelerometer sharedAccelerometer];
	theAccelerometer.delegate = nil;
	_bIsRunning = NO;
}


/**
 * Sends Accel Data back to the Device.
 */
- (void) accelerometer:(UIAccelerometer *)accelerometer didAccelerate:(UIAcceleration *)acceleration 
{
	if(_bIsRunning)
	{
		NSString * jsCallBack = nil;
		jsCallBack = [[NSString alloc] initWithFormat:@"navigator.accelerometer._onAccelUpdate(%f,%f,%f);", acceleration.x, acceleration.y, acceleration.z];
		[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
		[jsCallBack release];
	}
}

- (void)dealloc
{
    if (self.settings)
        [self.settings release];
    [super dealloc];
}

// TODO: Consider using filtering to isolate instantaneous data vs. gravity data -jm

/* 
 #define kFilteringFactor 0.1
 
 // Use a basic low-pass filter to keep only the gravity component of each axis.
 grav_accelX = (acceleration.x * kFilteringFactor) + ( grav_accelX * (1.0 - kFilteringFactor));
 grav_accelY = (acceleration.y * kFilteringFactor) + ( grav_accelY * (1.0 - kFilteringFactor));
 grav_accelZ = (acceleration.z * kFilteringFactor) + ( grav_accelZ * (1.0 - kFilteringFactor));
 
 // Subtract the low-pass value from the current value to get a simplified high-pass filter
 instant_accelX = acceleration.x - ( (acceleration.x * kFilteringFactor) + (instant_accelX * (1.0 - kFilteringFactor)) );
 instant_accelY = acceleration.y - ( (acceleration.y * kFilteringFactor) + (instant_accelY * (1.0 - kFilteringFactor)) );
 instant_accelZ = acceleration.z - ( (acceleration.z * kFilteringFactor) + (instant_accelZ * (1.0 - kFilteringFactor)) );
 

 */



@end
