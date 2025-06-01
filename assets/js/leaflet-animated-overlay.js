// Animated WebM overlay for Leaflet maps
document.addEventListener('DOMContentLoaded', function() {
    // Create a custom overlay class that extends L.VideoOverlay
    L.AnimatedWebmOverlay = L.VideoOverlay.extend({
        initialize: function(videoUrl, bounds, options) {
            L.VideoOverlay.prototype.initialize.call(this, videoUrl, bounds, options);
            
            // Set additional properties for the animated overlay
            this.options = L.extend({
                opacity: 0.5,
                autoplay: true,
                loop: true,
                muted: true,
                playsinline: true
            }, options);
        },
        
        _initImage: function() {
            L.VideoOverlay.prototype._initImage.call(this);
            
            // Apply additional attributes to the video element
            if (this._image) {
                this._image.autoplay = this.options.autoplay;
                this._image.loop = this.options.loop;
                this._image.muted = this.options.muted;
                this._image.playsInline = this.options.playsinline;
                
                // Set opacity
                this._image.style.opacity = this.options.opacity;
            }
        }
    });
    
    // Factory method for creating animated webm overlays
    L.animatedWebmOverlay = function(videoUrl, bounds, options) {
        return new L.AnimatedWebmOverlay(videoUrl, bounds, options);
    };
});

