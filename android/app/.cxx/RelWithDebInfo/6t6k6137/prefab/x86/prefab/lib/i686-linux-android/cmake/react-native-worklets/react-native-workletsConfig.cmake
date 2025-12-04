if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/Users/spxmac032/Documents/ReactNativeProject/govtrack/node_modules/react-native-worklets/android/build/intermediates/cxx/RelWithDebInfo/4v686v6k/obj/x86/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/spxmac032/Documents/ReactNativeProject/govtrack/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

