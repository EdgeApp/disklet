package com.reactlibrary;

import android.util.Base64;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;

public class DiskletModule extends ReactContextBaseJavaModule {
  private final Disklet mDisklet;

  public DiskletModule(ReactApplicationContext context) {
    super(context);
    mDisklet = new Disklet(context.getFilesDir());
  }

  @Override
  public String getName() {
    return "Disklet";
  }

  private void handleError(Promise promise, String path, Throwable e) {
    if (e instanceof FileNotFoundException) {
      promise.reject("ENOENT", "Cannot read '" + path + "'");
    } else {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void delete(String path, Promise promise) {
    try {
      mDisklet.delete(path);
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void getData(String path, Promise promise) {
    try {
      promise.resolve(Base64.encodeToString(mDisklet.getData(path), Base64.NO_WRAP));
    } catch (Throwable e) {
      handleError(promise, path, e);
    }
  }

  @ReactMethod
  public void getText(String path, Promise promise) {
    try {
      promise.resolve(mDisklet.getText(path));
    } catch (Throwable e) {
      handleError(promise, path, e);
    }
  }

  @ReactMethod
  public void list(String path, Promise promise) {
    try {
      Map<String, String> list = mDisklet.list(path);
      Map<String, Object> jsMap = new HashMap<>();
      for (String key : list.keySet()) {
        jsMap.put(key, list.get(key));
      }
      promise.resolve(Arguments.makeNativeMap(jsMap));
    } catch (Throwable e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void setData(String path, String base64, Promise promise) {
    try {
      mDisklet.setData(path, Base64.decode(base64, Base64.DEFAULT));
      promise.resolve(null);
    } catch (Throwable e) {
      promise.reject(e);
    }
  }

  @ReactMethod
  public void setText(String path, String text, Promise promise) {
    try {
      mDisklet.setText(path, text);
      promise.resolve(null);
    } catch (Throwable e) {
      promise.reject(e);
    }
  }
}
