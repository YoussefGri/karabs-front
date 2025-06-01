package com.karabs.acm;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {

    publicvoid onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerPlugin(GoogleAuth.class);
    }

}
