package storage;

import java.util.List;

public class StorageUtils {
    public static String toJSONArrayAlunos(List<Aluno> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i).toJSON());
        }
        sb.append(']');
        return sb.toString();
    }

    public static String toJSONArrayProfessores(List<Professor> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i).toJSON());
        }
        sb.append(']');
        return sb.toString();
    }
}
