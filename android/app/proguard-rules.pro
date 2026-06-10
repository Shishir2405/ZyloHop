# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in $SDK_DIR/tools/proguard/proguard-android.txt

# ─── React Native core ────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-dontwarn com.facebook.react.**

# ─── Reanimated ───────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# ─── React Native SVG ────────────────────────────────────────────
-keep public class com.horcrux.svg.** {*;}

# ─── Stripe ──────────────────────────────────────────────────────
-keep class com.stripe.android.** { *; }
-dontwarn com.stripe.**

# ─── Maps & Location ─────────────────────────────────────────────
-keep class com.google.android.gms.maps.** { *; }
-keep class com.google.maps.android.** { *; }
-dontwarn com.google.android.gms.**

# ─── OkHttp / Retrofit / Network ─────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**
-keepattributes Signature
-keepattributes *Annotation*

# ─── SignalR ─────────────────────────────────────────────────────
-keep class com.microsoft.signalr.** { *; }
-dontwarn com.microsoft.signalr.**

# ─── Strip log calls in release builds ──────────────────────────
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
