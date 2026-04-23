import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export const useEvents = () => {
    const queryClient = useQueryClient();

    // 1. BUSCA (Ler os dados)
    const {
        data: events = [],
        isLoading: loading
    } = useQuery({
        queryKey: ['events'],
        queryFn: eventService.getEvents,
    });

    // 2. FUNÇÃO AUXILIAR PARA ATUALIZAR O CACHE
    const invalidateCache = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
    };

    // 3. MUTAÇÕES (Ações que alteram o banco de dados)

    // -> Ensinando a CRIAR
    const createMutation = useMutation({
        mutationFn: eventService.createEvent,
        onSuccess: invalidateCache,
    });

    // -> Ensinando a ATUALIZAR
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => eventService.updateEvent(id, payload),
        onSuccess: invalidateCache,
    });

    // -> Ensinando a DELETAR
    const deleteMutation = useMutation({
        mutationFn: eventService.deleteEvent,
        onSuccess: invalidateCache,
    });

    // 4. Lógica de cálculo da semana
    const getWeeklyEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return events.filter((event) => {
            const eventDate = new Date(event.date + "T00:00:00");
            return eventDate >= today && eventDate <= nextWeek;
        });
    };

    // 5. Devolvendo todas as ferramentas para o Calendar.jsx usar
    return {
        events,
        loading,
        getWeeklyEvents,
        createEvent: createMutation.mutateAsync,
        updateEvent: updateMutation.mutateAsync,
        deleteEvent: deleteMutation.mutateAsync
    };
};