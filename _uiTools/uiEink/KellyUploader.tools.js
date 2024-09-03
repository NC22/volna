function getFBController(screen) {
    
    sbController = {};
    sbController.init = function(w, h) {
        
        if (sbController.bufferBitPerPixel && sbController.bufferBitPerPixel == screen.bitPerPixel) {
            console.log('skip init - same buffer size');
        } else {
            sbController.screenWidth = w;
            sbController.screenHeight = h;
            sbController.bufferLen = (sbController.screenWidth * sbController.screenHeight / 8) * screen.bitPerPixel;
            sbController.buffer = new Uint8Array( sbController.bufferLen );
            if (screen.bufferMod) sbController.bufferMod = new Uint8Array( sbController.bufferLen ); 
            else sbController.bufferMod = false;
            sbController.bufferBitPerPixel = screen.bitPerPixel;
            console.log('Init screen buffer [' + sbController.screenWidth + 'x' + sbController.screenHeight + '] - Bytes : ' + sbController.bufferLen);
        }
    };
    
    sbController.getBit = function(byte, position) {
    
        return (byte >> (7 - position)) & 0x1;
    };

    sbController.setBit = function(number, position, state){
    
        position = (7 - position);
        
        if (!state) {
            var mask = ~(1 << position);
            return number & mask;
        } else {
            return number | (1 << position) ;
        }        
    };
    
    sbController.reset = function(bgBlack) {
        for (var i = 0; i < sbController.bufferLen; i++) {
            // if (screen.bitPerPixel == 2) {
            //     sbController.buffer[i] = bgBlack ? 255 : 0;
            //} else {
                 sbController.buffer[i] = bgBlack ? 0 : 255;
            //}            
        }
    };   

    // probably may be solved by another way, need to test more 1.5 inch disp
    
    sbController.setScreenBufferPixel = function(x, y, val) {
        
        var bitPos = (y * sbController.screenWidth) + x;  
            bitPos = screen.bitPerPixel * bitPos;
        
        var bufferCursorByte = 0;
        var bufferCursorBit = 0;
        
        if (bitPos % 8) {
            
            bufferCursorByte = Math.floor(bitPos / 8);
            bufferCursorBit = bitPos - (bufferCursorByte * 8);
    
        } else {
    
            bufferCursorBit = 0;
            bufferCursorByte = bitPos / 8;
        }
        
        // console.log(bitPos);
        // console.log('edit ' + bufferCursorByte + ' - ' + bufferCursorBit);

        if (bufferCursorByte >= sbController.buffer.length) {

            console.log('Out of bounds ' + x + ' - ' + y);
        } else {
            
            var target = "buffer";            
            if (screen.bitPerPixel == 2) {
                var byteMod = sbController[target][bufferCursorByte];
                    byteMod = sbController.setBit(byteMod, bufferCursorBit, val[0]);
                    byteMod = sbController.setBit(byteMod, bufferCursorBit+1, val[1]);
                    
                sbController[target][bufferCursorByte] = byteMod;
            } else {
                sbController[target][bufferCursorByte] = sbController.setBit(sbController[target][bufferCursorByte], bufferCursorBit, val ? 0 : 1);
            }
        }        
    };
    
    sbController.init(screen.width, screen.height);
    return sbController;
}

// algo taken from - https://github.com/ticky project - https://github.com/ticky/canvas-dither

function greyscaleLuminance(image) {

    for (var i = 0; i <= image.data.length; i += 4) {

        image.data[i] = image.data[i + 1] = image.data[i + 2] = parseInt(image.data[i] * 0.21 + image.data[i + 1] * 0.71 + image.data[i + 2] * 0.07, 10);

    }

    return image;
}

function findNearestColor(pixel, asKey, colors) {
    var minDistance = Infinity;
    var nearestColor;
    var nearestColorKey;
    
    for (var key in colors) {
        var color = colors[key];
        var distance = Math.pow(color[0] - pixel[0], 2) + Math.pow(color[1] - pixel[1], 2) + Math.pow(color[2] - pixel[2], 2);
        if (distance < minDistance) {
            minDistance = distance;
            nearestColor = color;
            nearestColorKey = key;
        }
    }
    return asKey ? nearestColorKey : nearestColor;
}


function ditherAtkinson(image, imageWidth, drawColour, coefficient, devide) {
    
    if (!coefficient) coefficient = 0.125;
    
    skipPixels = 4;
    if (!drawColour)
        drawColour = false;

    if(drawColour == true)
        skipPixels = 1;

    imageLength    = image.data.length;

    for (currentPixel = 0; currentPixel <= imageLength; currentPixel += skipPixels) {

        if (image.data[currentPixel] <= 128) {
            newPixelColour = 0;
        } else {
            newPixelColour = 255;
        }

        err = parseInt((image.data[currentPixel] - newPixelColour)  * coefficient, 10);
        image.data[currentPixel] = newPixelColour;
        
        if (devide) {
            
            image.data[currentPixel + 4]                      += err * 1 / 8;
            image.data[currentPixel + 8]                      += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth) - 4]   += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth)]       += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth) + 4]   += err * 1 / 8;
            image.data[currentPixel + (8 * imageWidth)]       += err * 1 / 8;
            
        } else {
                
            image.data[currentPixel + 4]                        += err;
            image.data[currentPixel + 8]                        += err;
            image.data[currentPixel + (4 * imageWidth) - 4]        += err;
            image.data[currentPixel + (4 * imageWidth)]            += err;
            image.data[currentPixel + (4 * imageWidth) + 4]        += err;
            image.data[currentPixel + (8 * imageWidth)]            += err;
        }
        
        if (drawColour == false)
            image.data[currentPixel + 1] = image.data[currentPixel + 2] = image.data[currentPixel];

    }

    return image.data;
}


function ditherAtkinsonColor4(image, imageWidth, drawColour, coefficient ) {
    
    if (!coefficient) coefficient = 0.125;
    
    skipPixels = 4;
    if (!drawColour)
        drawColour = false;

    if(drawColour == true)
        skipPixels = 1;

    imageLength = image.data.length;

    for (currentPixel = 0; currentPixel <= imageLength; currentPixel += skipPixels) {
        
        var oldColor = image.data[currentPixel];
            var newColor;
            if (oldColor <= 128) {
                newColor = 0;
            } else {
                newColor = 255; 
            }

            err = parseInt((oldColor - newColor)  * coefficient, 10);
            image.data[currentPixel] = newColor;

            image.data[currentPixel + 4]                      += err * 1 / 8;
            image.data[currentPixel + 8]                      += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth) - 4]   += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth)]       += err * 1 / 8;
            image.data[currentPixel + (4 * imageWidth) + 4]   += err * 1 / 8;
            image.data[currentPixel + (8 * imageWidth)]       += err * 1 / 8;

            if (drawColour == false) {
                image.data[currentPixel + 1] = oldColor;
                image.data[currentPixel + 2] = oldColor;
        }
    }
}


function rgbToHsv(r, g, b) {
    
    if (r && g === undefined && b === undefined) {
        g = r.g, b = r.b, r = r.r;
    }

    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {h: h, s: s, v: v};
}
        