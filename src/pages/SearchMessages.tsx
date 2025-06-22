import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  User,
  Hash,
  Clock,
  MessageSquare,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  content: string;
  author: any;
  chatName: string;
  chatId: string;
  timestamp: Date;
  context: string[];
}

interface SearchFilters {
  query: string;
  author: string;
  chatId: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments: boolean;
  hasReactions: boolean;
}

const mockSearchResults: SearchResult[] = [
  {
    id: "msg-search-1",
    content: "Salut tout le monde ! Comment ça va aujourd'hui ?",
    author: {
      id: "user-paul",
      pseudo: "Paul",
      role: "user",
      status: "online",
    },
    chatName: "Général",
    chatId: "general",
    timestamp: new Date(Date.now() - 3600000),
    context: [
      "Marie: Bonjour !",
      "Paul: Salut tout le monde ! Comment ça va aujourd'hui ?",
      "Alexandre: Très bien merci, et toi ?",
    ],
  },
  {
    id: "msg-search-2",
    content: "N'oubliez pas la réunion de demain à 14h",
    author: {
      id: "owner-yupi",
      pseudo: "Yupi",
      role: "owner",
      status: "online",
    },
    chatName: "Staff",
    chatId: "staff",
    timestamp: new Date(Date.now() - 7200000),
    context: [
      "Yupi: N'oubliez pas la réunion de demain à 14h",
      "Alexandre: Noté ! Ordre du jour ?",
      "Yupi: Je l'envoie dans le chat staff",
    ],
  },
  {
    id: "msg-search-3",
    content: "Super travail sur le nouveau design !",
    author: {
      id: "admin-alex",
      pseudo: "Alexandre",
      role: "admin",
      status: "away",
    },
    chatName: "Général",
    chatId: "general",
    timestamp: new Date(Date.now() - 10800000),
    context: [
      "Marie: Voici la nouvelle maquette",
      "Alexandre: Super travail sur le nouveau design !",
      "Paul: Je suis d'accord, c'est très réussi",
    ],
  },
];

export default function SearchMessages() {
  const { user, chats } = useApp();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    author: "",
    chatId: "",
    hasAttachments: false,
    hasReactions: false,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = async () => {
    if (!filters.query.trim()) return;

    setIsSearching(true);

    // Simulation de recherche
    setTimeout(() => {
      const results = mockSearchResults.filter(
        (result) =>
          result.content.toLowerCase().includes(filters.query.toLowerCase()) ||
          result.author.pseudo
            .toLowerCase()
            .includes(filters.query.toLowerCase()),
      );

      // Appliquer les filtres
      let filteredResults = results;

      if (filters.author) {
        filteredResults = filteredResults.filter(
          (r) => r.author.id === filters.author,
        );
      }

      if (filters.chatId) {
        filteredResults = filteredResults.filter(
          (r) => r.chatId === filters.chatId,
        );
      }

      if (filters.dateFrom) {
        filteredResults = filteredResults.filter(
          (r) => r.timestamp >= filters.dateFrom!,
        );
      }

      if (filters.dateTo) {
        filteredResults = filteredResults.filter(
          (r) => r.timestamp <= filters.dateTo!,
        );
      }

      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      author: "",
      chatId: "",
      hasAttachments: false,
      hasReactions: false,
    });
    setSearchResults([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const goToMessage = (chatId: string, messageId: string) => {
    // Ici on naviguerait vers le chat et scrollerait vers le message
    console.log(`Navigate to chat ${chatId}, message ${messageId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Vous devez être connecté pour effectuer une recherche.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            Recherche de Messages
          </h1>
          <p className="text-muted-foreground mt-2">
            Trouvez rapidement des messages dans toutes vos conversations
          </p>
        </div>

        {/* Barre de recherche principale */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les messages..."
                    value={filters.query}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Recherche..." : "Rechercher"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>

              {/* Filtres avancés */}
              {showAdvancedFilters && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Auteur
                    </label>
                    <Select
                      value={filters.author}
                      onValueChange={(value) =>
                        setFilters({ ...filters, author: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les auteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les auteurs</SelectItem>
                        {chats[0]?.participants.map((participant) => (
                          <SelectItem
                            key={participant.id}
                            value={participant.id}
                          >
                            {participant.pseudo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Discussion
                    </label>
                    <Select
                      value={filters.chatId}
                      onValueChange={(value) =>
                        setFilters({ ...filters, chatId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les discussions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les discussions</SelectItem>
                        {chats.map((chat) => (
                          <SelectItem key={chat.id} value={chat.id}>
                            {chat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Date de début
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateFrom && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateFrom
                            ? formatDate(filters.dateFrom)
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) =>
                            setFilters({ ...filters, dateFrom: date })
                          }
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Date de fin
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateTo && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateTo
                            ? formatDate(filters.dateTo)
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) =>
                            setFilters({ ...filters, dateTo: date })
                          }
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="md:col-span-2 flex gap-4 items-end">
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Effacer les filtres
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Résultats de recherche ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => goToMessage(result.chatId, result.id)}
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar user={result.author} size="sm" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {result.author.pseudo}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              <Hash className="w-3 h-3 mr-1" />
                              {result.chatName}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(result.timestamp)}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm">
                              {highlightSearchTerm(
                                result.content,
                                filters.query,
                              )}
                            </p>

                            {/* Contexte du message */}
                            <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
                              <p className="font-medium text-muted-foreground mb-1">
                                Contexte :
                              </p>
                              {result.context.map((line, index) => (
                                <p
                                  key={index}
                                  className={cn(
                                    "text-muted-foreground",
                                    line === result.content &&
                                      "font-medium text-foreground",
                                  )}
                                >
                                  {line === result.content ? "→ " : "  "}
                                  {highlightSearchTerm(line, filters.query)}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* État vide */}
        {searchResults.length === 0 && filters.query && !isSearching && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos termes de recherche ou vos filtres.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Aide à la recherche */}
        {!filters.query && (
          <Card>
            <CardHeader>
              <CardTitle>Conseils de recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Recherche de base</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Tapez des mots-clés pour trouver des messages</li>
                    <li>• Recherchez par nom d'utilisateur</li>
                    <li>• Utilisez les filtres pour affiner les résultats</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recherche avancée</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Filtrez par discussion spécifique</li>
                    <li>• Limitez par période de temps</li>
                    <li>• Recherchez par auteur</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
