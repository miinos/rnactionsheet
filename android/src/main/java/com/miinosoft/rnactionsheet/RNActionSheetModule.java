package com.miinosoft.rnactionsheet;

import android.app.Activity;
import android.graphics.Color;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.concurrent.atomic.AtomicBoolean;

public class RNActionSheetModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public RNActionSheetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "RNActionSheet";
    }

    @ReactMethod
    public void showActionSheetWithOptions(ReadableMap options, final Callback onItemSelected) {
        final Activity activity = getCurrentActivity();

        if (activity == null) {
            onItemSelected.invoke(-1);
            return;
        }

        final AtomicBoolean callbackInvoked = new AtomicBoolean(false);

        final int cancelButtonIndex = options.hasKey("cancelButtonIndex")
                ? options.getInt("cancelButtonIndex")
                : -1;

        // Resolve default theme text color for Dark / Light mode compatibility
        TypedValue typedValue = new TypedValue();
        int defaultTextColor = Color.BLACK;
        if (activity.getTheme().resolveAttribute(android.R.attr.textColorPrimary, typedValue, true)) {
            defaultTextColor = typedValue.data;
        }

        // Tint color if specified
        int tintColor = defaultTextColor;
        if (options.hasKey("tintColor")) {
            try {
                tintColor = Color.parseColor(options.getString("tintColor"));
            } catch (Exception ignored) {
                tintColor = defaultTextColor;
            }
        }

        // Destructive color: prefer ?attr/colorError from the Material theme
        // so it respects the app's theme (including custom dark-mode palettes).
        int destructiveColor = resolveColorAttr(activity, com.google.android.material.R.attr.colorError);
        if (destructiveColor == 0) {
            // Fallback if the host app does not use a Material theme
            destructiveColor = Color.parseColor("#B00020");
        }

        // Ripple selectable background resource ID
        TypedValue rippleValue = new TypedValue();
        int selectableBackgroundResId = 0;
        if (activity.getTheme().resolveAttribute(android.R.attr.selectableItemBackground, rippleValue, true)) {
            selectableBackgroundResId = rippleValue.resourceId;
        }

        final int resolvedSelectableBackgroundResId = selectableBackgroundResId;
        final int resolvedTextColor = tintColor;
        final int resolvedDestructiveColor = destructiveColor;
        final int dividerColor = (defaultTextColor & 0x00FFFFFF) | 0x1F000000;

        activity.runOnUiThread(() -> {
            BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(activity);
            View bottomSheetView = LayoutInflater.from(activity).inflate(R.layout.bottom_sheet_layout, null);

            // Title
            TextView titleView = bottomSheetView.findViewById(R.id.bottom_sheet_title);
            if (options.hasKey("title") && options.getString("title") != null) {
                titleView.setText(options.getString("title"));
                titleView.setVisibility(View.VISIBLE);
            } else {
                titleView.setVisibility(View.GONE);
            }

            // Message
            TextView messageView = bottomSheetView.findViewById(R.id.bottom_sheet_message);
            if (options.hasKey("message") && options.getString("message") != null) {
                messageView.setText(options.getString("message"));
                messageView.setVisibility(View.VISIBLE);
            } else {
                messageView.setVisibility(View.GONE);
            }

            // Options list
            LinearLayout itemsContainer = bottomSheetView.findViewById(R.id.items_container);
            if (options.hasKey("options") && options.getArray("options") != null) {
                ReadableArray optionsArray = options.getArray("options");
                int size = optionsArray.size();

                for (int i = 0; i < size; i++) {
                    String optionText = optionsArray.getString(i);
                    final int index = i;

                    boolean isDisabled = isDisabledIndex(options, i);
                    boolean isCancel = (i == cancelButtonIndex);

                    LinearLayout optionLayout = new LinearLayout(activity);
                    optionLayout.setOrientation(LinearLayout.HORIZONTAL);
                    optionLayout.setGravity(Gravity.CENTER_VERTICAL);
                    optionLayout.setPadding(dpToPx(16), dpToPx(16), dpToPx(16), dpToPx(16));
                    optionLayout.setClickable(!isDisabled);
                    optionLayout.setFocusable(!isDisabled);
                    if (!isDisabled && resolvedSelectableBackgroundResId != 0) {
                        optionLayout.setBackgroundResource(resolvedSelectableBackgroundResId);
                    }

                    TextView textView = new TextView(activity);
                    textView.setText(optionText);
                    textView.setTextSize(16);

                    if (isDisabled) {
                        // Disabled items: 38% opacity on the text color
                        int disabledColor = (resolvedTextColor & 0x00FFFFFF) | 0x61000000;
                        textView.setTextColor(disabledColor);
                    } else if (isDestructiveIndex(options, i)) {
                        textView.setTextColor(resolvedDestructiveColor);
                    } else if (isCancel) {
                        // Cancel button: slightly dimmed to hint it closes the sheet
                        int cancelColor = (resolvedTextColor & 0x00FFFFFF) | 0xB3000000;
                        textView.setTextColor(cancelColor);
                        textView.setTextSize(16);
                    } else {
                        textView.setTextColor(resolvedTextColor);
                    }

                    LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                    );
                    textView.setLayoutParams(textParams);
                    optionLayout.addView(textView);

                    if (!isDisabled) {
                        optionLayout.setOnClickListener(v -> {
                            if (callbackInvoked.compareAndSet(false, true)) {
                                onItemSelected.invoke(index);
                            }
                            bottomSheetDialog.dismiss();
                        });
                    }

                    itemsContainer.addView(optionLayout);

                    // Add divider if not last item — use dpToPx(1) not a raw pixel
                    if (i < size - 1) {
                        View divider = new View(activity);
                        LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.MATCH_PARENT,
                                dpToPx(1)  // was: 1 (pixel) → now: 1dp
                        );
                        dividerParams.setMargins(dpToPx(16), 0, dpToPx(16), 0);
                        divider.setLayoutParams(dividerParams);
                        divider.setBackgroundColor(dividerColor);
                        itemsContainer.addView(divider);
                    }
                }
            }

            // Handle cancellation (tap outside, back button, swipe down)
            bottomSheetDialog.setOnCancelListener(dialog -> {
                if (callbackInvoked.compareAndSet(false, true)) {
                    onItemSelected.invoke(cancelButtonIndex);
                }
            });

            bottomSheetDialog.setOnDismissListener(dialog -> {
                if (callbackInvoked.compareAndSet(false, true)) {
                    onItemSelected.invoke(cancelButtonIndex);
                }
            });

            bottomSheetDialog.setContentView(bottomSheetView);
            bottomSheetDialog.show();
        });
    }

    private boolean isDestructiveIndex(ReadableMap options, int index) {
        if (!options.hasKey("destructiveButtonIndex")) {
            return false;
        }
        ReadableType type = options.getType("destructiveButtonIndex");
        if (type == ReadableType.Number) {
            return options.getInt("destructiveButtonIndex") == index;
        } else if (type == ReadableType.Array) {
            ReadableArray array = options.getArray("destructiveButtonIndex");
            if (array != null) {
                for (int i = 0; i < array.size(); i++) {
                    if (array.getInt(i) == index) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean isDisabledIndex(ReadableMap options, int index) {
        if (!options.hasKey("disabledButtonIndices")) {
            return false;
        }
        ReadableArray array = options.getArray("disabledButtonIndices");
        if (array != null) {
            for (int i = 0; i < array.size(); i++) {
                if (array.getInt(i) == index) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Resolves a color from the host Activity's theme by attribute ID.
     * Returns 0 if the attribute is not defined in the theme.
     */
    private int resolveColorAttr(Activity activity, int attrId) {
        TypedValue tv = new TypedValue();
        if (activity.getTheme().resolveAttribute(attrId, tv, true)) {
            if (tv.type >= TypedValue.TYPE_FIRST_COLOR_INT
                    && tv.type <= TypedValue.TYPE_LAST_COLOR_INT) {
                return tv.data;
            }
            // The attribute points to a color resource reference
            try {
                return activity.getResources().getColor(tv.resourceId, activity.getTheme());
            } catch (Exception ignored) {
                return 0;
            }
        }
        return 0;
    }

    private int dpToPx(int dp) {
        float density = reactContext.getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }
}