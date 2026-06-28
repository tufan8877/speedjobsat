import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Bitte wählen Sie mindestens 1 Stern aus").max(5),
  comment: z.string().trim().min(10, "Kommentar muss mindestens 10 Zeichen lang sein").max(500, "Kommentar kann maximal 500 Zeichen lang sein"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  profileId: number;
}

export function ReviewForm({ profileId }: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", `/api/profiles/${profileId}/reviews`, {
        rating: Number(data.rating),
        comment: data.comment.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });

      form.reset({ rating: 0, comment: "" });
      toast({
        title: "Bewertung abgesendet",
        description: "Vielen Dank für Ihre Bewertung!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Absenden",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    createReviewMutation.mutate(values);
  };

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ihre Bewertung</FormLabel>
                <FormControl>
                  <StarRating
                    rating={Number(field.value) || 0}
                    interactive
                    onRatingChange={(newRating) => {
                      field.onChange(Number(newRating));
                      form.clearErrors("rating");
                    }}
                    size="lg"
                    showText={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kommentar</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreiben Sie Ihre Erfahrung mit diesem Dienstleister mindestens 10 Zeichen"
                    className="resize-none min-h-[110px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createReviewMutation.isPending}
          >
            {createReviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bewertung wird gesendet...
              </>
            ) : (
              "Bewertung absenden"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
