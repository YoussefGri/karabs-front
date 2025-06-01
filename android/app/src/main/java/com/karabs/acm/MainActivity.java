package com.karabs.acm;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initialize GoogleAuth plugin
        registerPlugin(GoogleAuth.class);
    }
}
