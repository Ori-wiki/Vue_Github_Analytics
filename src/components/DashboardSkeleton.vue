<template>
  <div class="flex flex-col gap-6">
    <section class="surface grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.35fr_1fr]">
      <div class="flex gap-5">
        <div class="skeleton size-28 rounded-lg" />
        <div class="flex flex-1 flex-col gap-3">
          <div class="skeleton h-8 w-2/3" />
          <div class="skeleton h-4 w-full" />
          <div class="skeleton h-4 w-5/6" />
          <div class="flex gap-2">
            <div class="skeleton h-7 w-24" />
            <div class="skeleton h-7 w-28" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="item in 4" :key="item" class="stat-tile">
          <div class="skeleton h-3 w-20" />
          <div class="skeleton mt-3 h-8 w-16" />
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <div v-for="item in 2" :key="item" class="surface p-5">
        <div class="skeleton h-6 w-40" />
        <div class="skeleton mt-3 h-4 w-52" />
        <div class="skeleton mt-6 h-72 w-full" />
      </div>
    </section>

    <section class="surface p-5">
      <div class="skeleton h-11 w-full" />
      <div class="mt-5 space-y-3">
        <div v-for="item in 6" :key="item" class="skeleton h-12 w-full" />
      </div>
    </section>
  </div>
</template>
