import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Review form schema
const reviewFormSchema = z.object({
  rating: z.number().min(1, "Bitte geben Sie eine Bewertung ab").max(5),
  comment: z.string().min(10, "Kommentar muss mindestens 10 Zeichen lang sein").max(500, "Kommentar kann maximal 500 Zeichen lang sein"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  profileId: number;
}

export function ReviewForm({ profileId }: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });
  
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", `/api/profiles/${profileId}/reviews`, data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate profile data to refresh reviews
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      
      form.reset({ rating: 0, comment: "" });
      toast({
        title: "Bewertung abgesendet",
        description: "Vielen Dank für Ihre Bewertung!",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Absenden",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = (values: ReviewFormValues) => {
    if (values.rating === 0) {
      form.setError("rating", {
        type: "manual",
        message: "Bitte geben Sie eine Bewertung ab",
      });
      return;
    }
    
    setIsSubmitting(true);
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
                <FormControl>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm font-medium">Ihre Bewertung</span>
                    <StarRating
                      rating={field.value}
                      interactive={true}
                      onRatingChange={(newRating) => field.onChange(newRating)}
                      size="lg"
                      showText={false}
                    />
                  </div>
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
                <FormControl>
                  <Textarea
                    placeholder="Beschreiben Sie Ihre Erfahrung mit diesem Dienstleister (mindestens 10 Zeichen)"
                    className="resize-none min-h-[100px]"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
