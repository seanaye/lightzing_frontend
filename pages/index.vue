<template>
  <v-container fluid>
    <v-row justify="space-around">
      <v-col cols="12" md="6" lg="7">
        <v-card color="primary">
          <v-card-title>
            lightzing.me
          </v-card-title>
          <v-card-subtitle>
            Track, share and instantly pay expenses between friends
          </v-card-subtitle>
          <v-divider></v-divider>
          <v-card-text>
            Lorem ipsum
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="5">
        <v-card class="mt-lg-12" flat>
          <v-img :src="require('~/assets/screenshot.png')"></v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
</script>
