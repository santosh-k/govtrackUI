if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/spxmac032/Documents/ReactNativeProject/govtrack/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/5c5v6f58/obj/x86/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/spxmac032/Documents/ReactNativeProject/govtrack/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

