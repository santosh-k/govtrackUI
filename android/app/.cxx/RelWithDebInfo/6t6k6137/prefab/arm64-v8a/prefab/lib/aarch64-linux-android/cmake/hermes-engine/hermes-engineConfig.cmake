if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/spxmac032/.gradle/caches/8.14.3/transforms/5c15a37169e15d519c3aea04bffb5f6c/transformed/hermes-android-0.81.5-release/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/spxmac032/.gradle/caches/8.14.3/transforms/5c15a37169e15d519c3aea04bffb5f6c/transformed/hermes-android-0.81.5-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

