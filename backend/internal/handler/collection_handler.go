package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"novapost-backend/internal/domain"
	"novapost-backend/internal/middleware"
)

type CollectionHandler struct {
	repo domain.CollectionRepository
}

func NewCollectionHandler(repo domain.CollectionRepository) *CollectionHandler {
	return &CollectionHandler{repo: repo}
}

func (h *CollectionHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	list, err := h.repo.GetAll(r.Context())
	if err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, list)
}

func (h *CollectionHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	col, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		h.writeError(w, r, http.StatusNotFound, "Collection not found")
		return
	}
	h.writeJSON(w, http.StatusOK, col)
}

func (h *CollectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var col domain.Collection
	if err := json.NewDecoder(r.Body).Decode(&col); err != nil {
		h.writeError(w, r, http.StatusBadRequest, "Invalid collection payload")
		return
	}

	if err := h.repo.Create(r.Context(), &col); err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusCreated, col)
}

func (h *CollectionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var col domain.Collection
	if err := json.NewDecoder(r.Body).Decode(&col); err != nil {
		h.writeError(w, r, http.StatusBadRequest, "Invalid collection payload")
		return
	}
	col.ID = id

	if err := h.repo.Update(r.Context(), &col); err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, col)
}

func (h *CollectionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.repo.Delete(r.Context(), id); err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Collection deleted successfully"})
}

func (h *CollectionHandler) SaveItem(w http.ResponseWriter, r *http.Request) {
	colID := chi.URLParam(r, "id")
	var item domain.CollectionItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		h.writeError(w, r, http.StatusBadRequest, "Invalid request item payload")
		return
	}

	if err := h.repo.SaveItem(r.Context(), colID, &item); err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *CollectionHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	colID := chi.URLParam(r, "id")
	itemID := chi.URLParam(r, "itemId")

	if err := h.repo.DeleteItem(r.Context(), colID, itemID); err != nil {
		h.writeError(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Item deleted successfully"})
}

func (h *CollectionHandler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func (h *CollectionHandler) writeError(w http.ResponseWriter, r *http.Request, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"error":      msg,
		"request_id": middleware.GetRequestID(r.Context()),
		"status":     status,
	})
}
