import { Tabs } from "expo-router";

import React from "react";
import IconSymbol from "@expo/vector-icons/MaterialCommunityIcons";

const Layout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          animation: "shift",
          //   tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          //   tabBarButton: HapticTab,
          //   tabBarBackground: TabBarBackground,
        };
      }}
    >
      {/* <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      /> */}
      <Tabs.Screen
        name="Penyewaan"
        options={{
          title: "Sewa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="receipt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Peralatan"
        options={{
          title: "Alat",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Pelanggan"
        options={{
          title: "Pelanggan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="account-multiple" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Pemasukan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="finance" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Pengaturan"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
