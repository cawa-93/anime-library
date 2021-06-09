<template>
  <button
    class="btn"
    @click="isDialogOpened = true"
  >
    Добавить
  </button>

  <!-- Modal -->

  <dialog
    :open="isDialogOpened"
    class="modal-dialog p-0 border-0"
  >
    <form
      class="modal-content"
      @submit.prevent="onSave"
    >
      <div class="modal-header">
        <h5
          id="exampleModalLabel"
          class="modal-title"
        >
          Modal title
        </h5>
        <button
          type="button"
          class="btn btn-link win-icon"
          data-bs-dismiss="modal"
          aria-label="Close"
          @click="isDialogOpened = false"
        >
          &#xE8BB;
        </button>
      </div>
      <div class="modal-body">
        <fieldset>
          <label
            for="group-title"
            class="form-label"
          >Название списка</label>
          <input
            id="group-title"
            type="text"
            name="group-title"
            class="form-control"
          >

          <label
            for="limit"
            class="form-label"
          >Максимум результатов</label>
          <input
            id="limit"
            type="number"
            min="1"
            max="50"
            value="8"
            name="limit"
            class="form-control"
          >
        </fieldset>

        <fieldset>
          <legend>Статус</legend>

          <div class="form-check">
            <input
              id="ongoing"
              checked
              value="ongoing"
              type="checkbox"
              class="form-check-input"
              name="status"
            >
            <label
              class="form-check-label"
              for="ongoing"
            >Сейчас выходит</label>
          </div>

          <div class="form-check">
            <input
              id="released"
              checked
              value="released"
              type="checkbox"
              class="form-check-input"
              name="status"
            >
            <label
              class="form-check-label"
              for="released"
            >Вышедшее</label>
          </div>
          <div class="form-check">
            <input
              id="latest"
              checked
              value="latest"
              type="checkbox"
              class="form-check-input"
              name="status"
            >
            <label
              class="form-check-label"
              for="latest"
            >Недавно вышедшие</label>
          </div>
        </fieldset>


        <fieldset>
          <legend>Тип</legend>

          <div class="form-check">
            <input
              id="tv"
              checked
              value="tv"
              type="checkbox"
              class="form-check-input"
              name="kind"
            >
            <label
              class="form-check-label"
              for="tv"
            >TV Сериал</label>
          </div>

          <div class="form-check">
            <input
              id="movie"
              checked
              value="movie"
              type="checkbox"
              class="form-check-input"
              name="kind"
            >
            <label
              class="form-check-label"
              for="movie"
            >Фильм</label>
          </div>


          <div class="form-check">
            <input
              id="ova"
              checked
              value="ova"
              type="checkbox"
              class="form-check-input"
              name="kind"
            >
            <label
              class="form-check-label"
              for="ova"
            >OVA</label>
          </div>

          <div class="form-check">
            <input
              id="ona"
              checked
              value="ona"
              type="checkbox"
              class="form-check-input"
              name="kind"
            >
            <label
              class="form-check-label"
              for="ona"
            >ONA</label>
          </div>

          <div class="form-check">
            <input
              id="special"
              checked
              value="special"
              type="checkbox"
              class="form-check-input"
              name="kind"
            >
            <label
              class="form-check-label"
              for="special"
            >Спешл</label>
          </div>
        </fieldset>


        <fieldset>
          <legend>Сортировка</legend>

          <div class="form-check">
            <input
              id="ranked"
              checked
              value="ranked"
              type="radio"
              class="form-check-input"
              name="order"
            >
            <label
              class="form-check-label"
              for="ranked"
            >По рейтингу</label>
          </div>

          <div class="form-check">
            <input
              id="popularity"
              value="popularity"
              type="radio"
              class="form-check-input"
              name="order"
            >
            <label
              class="form-check-label"
              for="popularity"
            >По популярности</label>
          </div>
          <div class="form-check">
            <input
              id="aired_on"
              value="aired_on"
              type="radio"
              class="form-check-input"
              name="order"
            >
            <label
              class="form-check-label"
              for="aired_on"
            >По дате выхода</label>
          </div>
        </fieldset>
      </div>
      <div class="modal-footer">
        <button
          type="submit"
          class="btn btn-primary"
        >
          Добавить список
        </button>
      </div>
    </form>
  </dialog>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {saveCustomList} from '/@/components/CustomLists/CustomListsDB';


export default defineComponent({
  name: 'CustomListsAdd',

  emits: ['submit'],

  setup(_, {emit}) {

    const isDialogOpened = ref(false);

    const onSave = async(event: Event) => {
      if (!event || !event.target || !(event.target instanceof HTMLFormElement)) {
        return;
      }

      const formData = new FormData(event.target);

      const newList = {
        title: formData.get('group-title') as string || '',
        requestParams: {
          limit: Number(formData.get('limit')) || 5,
          status: formData.getAll('status').join(','),
          kind: formData.getAll('kind').join(','),
          order: formData.get('order') as string || '',
        },
      };

      isDialogOpened.value = false;
      await saveCustomList(newList);
      emit('submit', newList);
    };

    return {isDialogOpened, onSave};
  },
});
</script>

<style scoped>

</style>
