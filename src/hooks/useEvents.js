import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export const useEvents = () => {
    const queryClient = useQueryClient();

    // 1. USE QUERY: Substitui o useState, o useEffect e o loading de uma vez só!
    const {
        data: events = [], // Se não houver dados ainda, o padrão é um array vazio
        isLoading: loading
    } = useQuery({
        queryKey: ['events'], // O "nome" desta página no bloco de notas do garçom
        queryFn: eventService.getEvents, // A função que vai na cozinha buscar os dados
    });

    // 2. USE MUTATION: Preparamos a função de deletar
    const deleteEventMutation = useMutation({
        mutationFn: (id) => eventService.deleteEvent(id),
        onSuccess: () => {
            // Quando der certo, dizemos ao garçom que a lista antiga não vale mais
            queryClient.invalidateQueries(['events']);
        }
    });

    // 3. Função ajudante (mantém a mesma lógica matemática)
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

    return {
        events,
        loading,
        getWeeklyEvents,
        // Exportamos a função de deletar pronta para uso
        deleteEvent: deleteEventMutation.mutateAsync
    };
};