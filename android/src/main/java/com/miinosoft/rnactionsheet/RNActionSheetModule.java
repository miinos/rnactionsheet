package com.miinosoft.rnactionsheet;

import android.app.Activity;
import android.view.Gravity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.graphics.Color;

public class RNActionSheetModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public RNActionSheetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNActionSheet";
    }

    @ReactMethod
    public void showActionSheetWithOptions(ReadableMap optionss, final Callback onItemSelected) {
        final Activity activity = getCurrentActivity();

        if (activity == null) return;

        activity.runOnUiThread(() -> {
            BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(activity);
            View bottomSheetView = LayoutInflater.from(activity).inflate(R.layout.bottom_sheet_layout, null);

            // Setup title if provided
            TextView titleView = bottomSheetView.findViewById(R.id.bottom_sheet_title);
            if (optionss.hasKey("title")) {
                titleView.setText(optionss.getString("title"));
                titleView.setVisibility(View.VISIBLE);
            } else {
                titleView.setVisibility(View.GONE);
            }
            // Setup message if provided
            TextView messageView = bottomSheetView.findViewById(R.id.bottom_sheet_message);
            if (optionss.hasKey("message")) {
                messageView.setText(optionss.getString("message"));
                messageView.setVisibility(View.VISIBLE);
            } else {
                messageView.setVisibility(View.GONE);
            }

            // Setup options list
            LinearLayout itemsContainer = bottomSheetView.findViewById(R.id.items_container);
            if (optionss.hasKey("options") && optionss.getArray("options") != null) {
                ReadableArray options = optionss.getArray("options");
                int dest_index = optionss.getInt("destructiveButtonIndex");
                int canel_index = optionss.getInt("cancelButtonIndex");
                int color = Color.BLACK;
                if(optionss.hasKey("tintColor")){
                    color = Color.parseColor(optionss.getString("tintColor"));
                }
                for (int i = 0; i < options.size(); i++) {
                    String option = options.getString(i);
                    final int index = i;

                    // Create option layout
                    LinearLayout optionLayout = new LinearLayout(activity);
                    optionLayout.setOrientation(LinearLayout.HORIZONTAL);
                    optionLayout.setGravity(Gravity.CENTER_VERTICAL);
                    optionLayout.setPadding(dpToPx(16), dpToPx(16), dpToPx(16), dpToPx(16));
                    optionLayout.setClickable(true);
                    optionLayout.setFocusable(true);

                    // Text
                    TextView textView = new TextView(activity);
                    textView.setText(option);
                    textView.setTextSize(16);

                    // Set text color if provided
                    if (dest_index == i) {
                        textView.setTextColor(Color.RED);
                    }else{
                        textView.setTextColor(color);
                    }

                    LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                    );
                    textView.setLayoutParams(textParams);

                    optionLayout.addView(textView);

                    // Click listener
                    optionLayout.setOnClickListener(v -> {
                        onItemSelected.invoke(index);
                        bottomSheetDialog.dismiss();
                    });

                    itemsContainer.addView(optionLayout);

                    // Add divider if not last item
                    if (i < options.size() - 1) {
                        View divider = new View(activity);
                        LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.MATCH_PARENT,
                                1
                        );
                        dividerParams.setMargins(dpToPx(16), 0, dpToPx(16), 0);
                        divider.setLayoutParams(dividerParams);
                        divider.setBackgroundColor(0x1A000000);
                        itemsContainer.addView(divider);
                    }
                }
            }

            bottomSheetDialog.setContentView(bottomSheetView);
            bottomSheetDialog.show();
        });
    }

    private int dpToPx(int dp) {
        float density = reactContext.getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }
}